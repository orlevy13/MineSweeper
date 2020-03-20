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

function setDifficulty(size) {
    gDifficulty.SIZE = size;
    if (size === 4) {
        gDifficulty.MINES = 2;
        gDifficulty.level = 'easy';
    } else if (size === 8) {
        gDifficulty.MINES = 12;
        gDifficulty.level = 'hard';
    } else {
        gDifficulty.MINES = 30;
        gDifficulty.level = 'extreme';
    }
    return init();
}

function checkWin() {
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
    switch (gDifficulty.level) { //best time depends on the difficulty level
        case 'easy':
            if (localStorage.easyBestTime === undefined) {
                localStorage.easyBestTime = gGame.secondsPassed;
            } else {
                if (localStorage.easyBestTime > gGame.secondsPassed) {
                    localStorage.easyBestTime = gGame.secondsPassed;
                }
            }
            break;
        case 'hard':
            if (localStorage.hardBestTime === undefined) {
                localStorage.hardBestTime = gGame.secondsPassed;
            } else {
                if (localStorage.hardBestTime > gGame.secondsPassed) {
                    localStorage.hardBestTime = gGame.secondsPassed;
                }
            }
            break;
        case 'extreme':
            if (localStorage.extremeBestTime === undefined) {
                localStorage.extremeBestTime = gGame.secondsPassed;
            } else {
                if (localStorage.extremeBestTime > gGame.secondsPassed) {
                    localStorage.extremeBestTime = gGame.secondsPassed;
                }
            }
            break;
    }
    renderBestTime(gDifficulty.level);
}

function renderBestTime(difficulty) {
    switch (difficulty) { //rendering in accordance to difficulty level
        case 'easy':
            var time = localStorage.easyBestTime;
            break;
        case 'hard':
            var time = localStorage.hardBestTime;
            break;
        case 'extreme':
            var time = localStorage.extremeBestTime;
            break;
    }
    if (time === undefined) document.querySelector('.best-time').innerText = 'Best Time: None yet';
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

function renderSafeClicks() {
    document.querySelector('.safe-clicks-count').innerText = gGame.safeClicks;
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