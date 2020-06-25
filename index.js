/* Elements */

var banner, start;
var game, countdown, shuffle, board, pathmap;
var result, record, victory, again;

/* Data */

var empty = [];
var ids = [];
var pid;
var matches = 0;

var w, h, n;

/* Initialize Board */

function updateBoard() {
    for (var i = 0; i < 36; i++) {
        var tile = tiles[ids[i]];
        board.appendChild(tile);
        if (empty[i]) {
            tile.classList.add("hidden");
        }
        else {
            tile.classList.remove("hidden");
        }
    }
}

/* Shuffle */

function disableShuffle() {
    shuffle.classList.add("disabled");
}

function enableShuffle() {
    shuffle.classList.remove("disabled");
}

/* Draw Path */

function showPath() {
    pathmap.classList.remove("hidden");
}

function hidePath() {
    pathmap.classList.add("hidden");
}

function drawPath(path) {
    var box = board.getBoundingClientRect();
    if (box.width > box.height) {
        var size = box.width / 9;
        var x = box.left + size / 2;
        var y = box.top + size / 2;
        for (var i = 0; i < 2; i++) {
            pathmap.children[i].setAttribute("points", [
                (x + path[0][0] * size) + "," + (y + path[0][1] * size),
                (x + path[1][0] * size) + "," + (y + path[1][1] * size),
                (x + path[2][0] * size) + "," + (y + path[2][1] * size),
                (x + path[3][0] * size) + "," + (y + path[3][1] * size)
            ].join(" "));
        }
    }
    else {
        var size = box.height / 9;
        var x = box.right - size / 2;
        var y = box.top + size / 2;
        for (var i = 0; i < 2; i++) {
            pathmap.children[i].setAttribute("points", [
                (x - path[0][1] * size) + "," + (y + path[0][0] * size),
                (x - path[1][1] * size) + "," + (y + path[1][0] * size),
                (x - path[2][1] * size) + "," + (y + path[2][0] * size),
                (x - path[3][1] * size) + "," + (y + path[3][0] * size)
            ].join(" "));
        }
    }
    showPath();
    setTimeout(hidePath, 250);
}

/* Select Tile */

function select(tile) {
    if (tile.target) {
        tile = tile.target;
    }
    if (tile.classList.contains("tile")) {
        var qid = parseInt(tile.id);
        if (typeof pid == "undefined") {
            tile.classList.add("selected");
            pid = qid;
        }
        else {
            var p = ids.indexOf(pid);
            var q = ids.indexOf(qid);
            var paths = findPaths(p, q);
            if (paths.length) {
                tile.classList.add("selected");
                tile.classList.add("matched");
                tiles[pid].classList.add("matched");
                trimPaths(paths);
                drawPath(paths[Math.floor(Math.random() * paths.length)]);

                empty[p] = true;
                empty[q] = true;
                matches++;
                if (matches >= 18) {
                    endGame();
                }
            }
            else {
                tiles[pid].classList.remove("selected");
            }
            pid = undefined;
        }
    }
    else if (tile.id != "board") {
        select(tile.parentElement); /* bubble up */
    }
}

/* Start Game */

var currentBoard;

function startGame() {
    game.classList.remove("idle");
    countdown.classList.remove("hidden");
    banner.classList.add("hidden");
    result.classList.add("hidden");

    for (var i = 0; i < 4; i++) {
        countdown.children[i].classList.add("tick" + i);
    }
    setTimeout(reallyStart, 4000);

    // currentBoard = new Board("vtile", 20);
    currentBoard = new Board("tile", 18);
    shuffleTiles();
}

function reallyStart() {
    countdown.classList.add("hidden");
}

/* End Game */

function endGame() {
    game.classList.add("idle");
    result.classList.remove("hidden");
}

function shuffleTiles() {
    currentBoard.shuffle();
    for (var i = 0; i < currentBoard.orderset.length; i++) {
        board.appendChild(currentBoard.tileset[currentBoard.orderset[i]]);
    }
}

/* Restart Game */

function restartGame() {
    for (var i = 0; i < 4; i++) {
        countdown.children[i].classList.remove("tick" + i);
    }
    countdown.classList.remove("hidden");

    startGame();
}

/* Initialize Listeners */

function init() {
    banner = document.getElementById("banner");
    start = document.getElementById("start");

    game = document.getElementById("game");
    countdown = document.getElementById("countdown");
    shuffle = document.getElementById("shuffle");
    board = document.getElementById("board");
    pathmap = document.getElementById("pathmap");

    result = document.getElementById("result");
    record = document.getElementById("record");
    victory = document.getElementById("victory");
    again = document.getElementById("again");

    start.addEventListener("click", startGame);
    shuffle.addEventListener("click", shuffleTiles);
    board.addEventListener("click", select);
    again.addEventListener("click", restartGame);
}

window.addEventListener("DOMContentLoaded", init);
