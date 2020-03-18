'use strict'

const MINE = '💣';
const FLAG = '🚩';

var gDifficulty = {
    SIZE: 4,
    MINES: 2
};

var gGame;
var gIsMinesPlaced;
var gBoard;
var gStartTime = null;
var gTimeInterval;


function init() {
    gBoard = createBoard(gDifficulty.SIZE);
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        hints: 3
    };
    gIsMinesPlaced = false;
    // renderHintsCount();
    initTimer();
    renderBoard(gBoard);
    console.table(gBoard);
}


function setDifficulty(size) {
    gDifficulty.SIZE = size;
    if (size === 4) gDifficulty.MINES = 2;
    else if (size === 8) gDifficulty.MINES = 12;
    else gDifficulty.MINES = 30;
    return init()
}


function createBoard(size) {
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            var cellObj = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,

            }
            board[i][j] = cellObj;
        }
    }
    return board;
};


function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            var cellContent;

            if (cell.isMine && cell.isShown) cellContent = MINE;
            else if (cell.isMarked) cellContent = FLAG;
            else if (!cell.isShown || !cell.minesAroundCount) cellContent = '';
            else cellContent = cell.minesAroundCount;

            var cellClass = (cell.isShown) ? 'mark' : '';
            var cellId = `cell-${i}-${j}`;
            strHTML += `<td id="${cellId}"  oncontextmenu="cellMarked(this, event)" class="${cellClass}" 
            onclick=cellClicked(this) >${cellContent}</td>`;
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


function countMinesAround(cellI, cellJ, mat) {
    if (mat[cellI][cellJ].isMine) return null;
    var count = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            if (mat[i][j].isMine) count++;
        }
    }
    return count;
}


function cellClicked(elCell) {
    if (!gStartTime) {
        startGame();
    }
    if (!gIsMinesPlaced) {
        placeMinesWithDelay();
        gIsMinesPlaced = true;
    }
    if (!gGame.isOn) return;

    var location = getCellLocation(elCell.id);
    var cell = gBoard[location.i][location.j];

    if (cell.isShown || cell.isMarked) return;// if user clicks on a clicked/marked cell
    elCell.classList.add('mark');// for the bgc

    if (cell.isMine) {
        showAllMines(gBoard);
        gameOver(false);
    }

    else {
        cell.isShown = true;
        gGame.shownCount++;
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
            if (mat[i][j].isMine || mat[i][j].isMarked) continue;
            if (mat[i][j].isShown) continue;
            mat[i][j].isShown = true;
            gGame.shownCount++;
        }
    }
}


// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellLocation(strCellId) {
    var parts = strCellId.split('-')
    var location = { i: +parts[1], j: +parts[2] };
    return location;
}


function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`#cell-${location.i}-${location.j}`)
    elCell.innerText = value;
}


function placeMinesRandomly(count, board) {
    while (count) {
        var randomI = getRandomInt(0, gDifficulty.SIZE);
        var randomJ = getRandomInt(0, gDifficulty.SIZE);
        if (board[randomI][randomJ].isMine ||
            board[randomI][randomJ].isShown) continue;
        board[randomI][randomJ].isMine = true;
        count--;
    }
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


function gameOver(isWin) {
    gGame.isOn = false;
    var message = (isWin) ? 'You won!' : 'You have lost..';
    alert(message);
    clearInterval(gTimeInterval);
    showAllMines(gBoard);
}


function checkWin() {
    if (gGame.shownCount + gGame.markedCount ===
        (gDifficulty.SIZE ** 2) - gDifficulty.MINES) {
        return gameOver(true);
    }
    return;
}


function cellMarked(elCell, ev) {
    ev.preventDefault();
    if (!gStartTime) {
        startGame();
    }
    var location = getCellLocation(elCell.id);
    if (gBoard[location.i][location.j].isShown) return;
    gBoard[location.i][location.j].isMarked = !gBoard[location.i][location.j].isMarked;
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


function renderTime() {
    var delta = Date.now() - gStartTime;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = 'Timer: ' + parseInt(delta / 1000);
}


function initTimer() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = 'Timer: 0';
    gStartTime = null;
    clearInterval(gTimeInterval)
    gTimeInterval = null;
}


function startGame() {
    gStartTime = Date.now();
    gGame.isOn = true;
    gTimeInterval = setInterval(renderTime, 500);
}


function placeMinesWithDelay() {
    setTimeout(placeMinesRandomly, 10, gDifficulty.MINES, gBoard);
    setTimeout(setMinesNegsCount, 10, gBoard);
    setTimeout(renderBoard, 10, gBoard);
}

function renderHintsCount() {
    var elHintsCount = document.querySelector('.hints-count').innerText = gGame.hints;
}