'use strict'


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
                isPeaked: false

            }
            board[i][j] = cellObj;
        }
    }
    return board;
};

function setDifficulty(size, minesCount, level) {
    gDifficulty.SIZE = size;
    gDifficulty.MINES = minesCount;
    gDifficulty.level = level;
    return init();
}

function checkWin() {
    //cells number - shown cells === mine cells  
    if ((gDifficulty.SIZE ** 2 - gGame.shownCount) === gDifficulty.MINES) {
        return gameOver(true);
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


function renderTime() {
    var delta = Date.now() - gStartTime;
    var secondsPassed = parseInt(delta / 1000);
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = 'Timer: ' + secondsPassed;
    gGame.secondsPassed = secondsPassed;
}

function setBestTime() {
    var level = gDifficulty.level;
    if (localStorage.getItem(level) === null) {
        localStorage.setItem(level, gGame.secondsPassed);
    } else if (localStorage.getItem(level) > gGame.secondsPassed) {
        localStorage.setItem(level, gGame.secondsPassed);
    }
    renderBestTime(level);
}

function renderBestTime(level) {
    var time = localStorage.getItem(level);
    if (time === null) document.querySelector('.best-time').innerText = 'Best Time: None yet';
    else document.querySelector('.best-time').innerText = 'Best time: ' + time;
}

function getCellLocation(strCellId) {
    // Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
    var parts = strCellId.split('-')
    var location = { i: +parts[1], j: +parts[2] };
    return location;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function renderGameStats() {
    document.querySelector('.face').innerText = '😃';
    document.querySelector('.safe-clicks-count').innerText = gGame.safeClicks;
    var livesCount = '';
    for (var i = 0; i < gGame.lives; i++) {
        livesCount += '❤️';
    }
    document.querySelector('.lives-count').innerText = livesCount;
    var hintsCount = '';
    for (i = 0; i < gGame.hints; i++) {
        hintsCount += '💡';
    }
    document.querySelector('.hints-count').innerText = hintsCount;
    document.querySelector('.game-over-modal').style = "display: none";
}

function playBtnSound(ev) {
    btnHoverSound.play();
}