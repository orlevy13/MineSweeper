'use strict'

const MINE = '💣';
const FLAG = '🚩';
const EMPTY = '';

var gDifficulty = {
    SIZE: 4,
    MINES: 2,
    level: 'easy',
};

var gGame;
var gIsMinesPlaced;
var gBoard;
var gStartTime;
var gTimeInterval;
var gHintMode;


function init() {
    gBoard = createBoard(gDifficulty.SIZE);
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secondsPassed: 0,
        hints: 3,
        lives: (gDifficulty.level === 'easy') ? 1 : 3,
        safeClicks: 3
    };
    gIsMinesPlaced = false;
    gHintMode = false;
    document.querySelector('.game-over-modal').style = "display: none";
    renderGameStats();//like hints,lives,safeClicks
    initTimer();
    renderBoard(gBoard);
    renderBestTime(gDifficulty.level)
}


function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            var cellContent;

            if (cell.isMine && cell.isShown) cellContent = MINE;
            else if (cell.isMarked && !cell.isShown) cellContent = FLAG;
            else if (!cell.isShown || !cell.minesAroundCount) cellContent = EMPTY;
            else cellContent = cell.minesAroundCount;

            var cellClass = (cell.isShown) ? 'mark' : '';
            var cellId = `cell-${i}-${j}`;
            strHTML += `<td id="${cellId}"  oncontextmenu="cellMarked(this, event)"
             class="${cellClass}" onclick="cellClicked(this)" >${cellContent}</td>`;
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
};


function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            cell.minesAroundCount = countMinesAround(i, j, board);
        }
    }
}


function cellClicked(elCell) {
    if (!gStartTime) {
        startGame();
    }

    var location = getCellLocation(elCell.id);
    var cell = gBoard[location.i][location.j];

    if (!gGame.isOn) return;

    if (gHintMode) {
        showHint(location);
        setTimeout(unShowHint, 1000, location);
        return;
    }

    if (cell.isShown || cell.isMarked) return;// if user clicks on a clicked/marked cell
    elCell.classList.add('mark');// for the bgc

    if (cell.isMine) {
        if (!gGame.lives) { //ran out of lives- blow all mines, gameover.
            showAllMines(gBoard);
            gameOver(false);
        } else {
            gGame.lives--;
            cell.isShown = true; // revealing the stepped on mine
            renderBoard(gBoard);
            checkWin();
            renderGameStats();
            return;
        }
    }

    else {
        cell.isShown = true;
        gGame.shownCount++;

        if (!gIsMinesPlaced) { //placing mines only on first click
            placeMinesRandomly(gDifficulty.MINES, gBoard);
            setMinesNegsCount(gBoard);
            gIsMinesPlaced = true;
        }

        if (!cell.minesAroundCount) expandShown(gBoard, location.i, location.j);
        renderBoard(gBoard);
        checkWin();
    }
}


function expandShown(mat, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            var cell = mat[i][j];
            //only expose valid cells
            if (cell.isMine || cell.isMarked || cell.isShown) continue;

            mat[i][j].isShown = true;
            gGame.shownCount++;
            //Full expand
            if (!cell.minesAroundCount) expandShown(mat, i, j);
        }
    }
}


function placeMinesRandomly(count, board) {
    while (count) {// so that all mines will be placed
        var randomI = getRandomInt(0, gDifficulty.SIZE);
        var randomJ = getRandomInt(0, gDifficulty.SIZE);
        if (board[randomI][randomJ].isMine ||
            board[randomI][randomJ].isShown) continue;
        board[randomI][randomJ].isMine = true;
        count--;
    }
}


function gameOver(isWin) {
    gGame.isOn = false;
    var elFace = document.querySelector('.face');
    var face = (isWin) ? '😎' : '💀';
    var message = (isWin) ? '👑WINNER👑' : '😁LOSER😁';
    elFace.innerText = face;
    var elModal = document.querySelector('.game-over-modal');
    elModal.innerText = message;
    elModal.style = "display: inline-block";
    clearInterval(gTimeInterval);
    showAllMines(gBoard);
    if (isWin) {
        setBestTime();
    }
}


function cellMarked(elCell, ev) {
    ev.preventDefault();
    if (!gStartTime) {
        startGame();
    }
    var location = getCellLocation(elCell.id);
    var cell = gBoard[location.i][location.j];
    if (cell.isShown) return;
    if (cell.isMarked) {
        cell.isMarked = false;
        gGame.markedCount--;
    } else {
        cell.isMarked = true;
        gGame.markedCount++;
        checkWin();
    }
    renderBoard(gBoard);
}


function showAllMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            if (cell.isMine) cell.isShown = true;
        }
    }
    renderBoard(gBoard);
}


function initTimer() {
    document.querySelector('.timer').innerText = 'Timer: 0';
    gStartTime = null;
    clearInterval(gTimeInterval)
    gTimeInterval = null;
}


function startGame() {
    gStartTime = Date.now();
    gGame.isOn = true;
    gTimeInterval = setInterval(renderTime, 500);
}


function hintClicked() {
    if (!gGame.isOn) return;//can't use hint as first click
    if (gHintMode) return;//if user clicked the hint and didn't use it yet
    if (!gGame.hints) return console.log('You used all of your hints..');
    if (!gIsMinesPlaced) return; //if user wants to use hint before mines were placed
    gHintMode = true;
    gGame.hints--;
    renderGameStats();
}


function showHint(location) {
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (gBoard[i][j].isShown) continue;
            gBoard[i][j].isShown = true;
            gBoard[i][j].isPeaked = true; //so that I'll know what to hide after a second
        }
    }
    renderBoard(gBoard);
    gHintMode = false;
}


function unShowHint(location) {
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (!gBoard[i][j].isPeaked) continue;
            gBoard[i][j].isShown = false;
            gBoard[i][j].isPeaked = false; //so I could reveal the same cell with next hint
        }
    }
    renderBoard(gBoard)
}


function markSafeCell(board) {
    if (!gGame.isOn || !gGame.safeClicks) return; //can't use before first click
    var safeCells = getSafeUnshownCells(board);
    var randomSafeCell = safeCells[getRandomInt(0, safeCells.length)];
    var elCell = document.querySelector(`#cell-${randomSafeCell.i}-${randomSafeCell.j}`);
    elCell.classList.add('safe-cell');
    setTimeout(function () { elCell.classList.remove('safe-cell') }, 2000);
    gGame.safeClicks--;
    renderGameStats();
}


function getSafeUnshownCells(board) {
    if (!gGame.isOn) return;
    var safeCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (!cell.isMine && !cell.isShown) {
                safeCells.push({ i: i, j: j });
            }
        }
    }
    return safeCells;
}
