/* Elements */

var dynamicStyle;
var game, shuffle, board, pathmap, countdown;
var banner, sandy, ai, start;
var result, newrecord, victory, again;

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

var i0;

function selectTile(e) {
    if ("i" in e.target.dataset) {
        e.target.classList.add("selected");
        var i = parseInt(e.target.dataset.i);
        if (typeof i0 == "undefined") {
            i0 = i;
        }
        else {
            i0 = undefined;
        }
        console.log(currentBoard.tileset[i]);
        console.log(currentBoard.orderset.indexOf(i));
        currentBoard.select(i);
    }

    return;

    if (typeof i0 == "undefined") {
        i0 = i;
    }
    else {
        // dostuff
        i0 = undefined;
    }

    if (e.target) {
        console.log(tile.target);
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
        selectTile(tile.parentElement); /* bubble up */
    }
}

/* * */

var currentBoard;
var time0;
var timerID;

function formatTime(time) {
    var ms = parseInt(time / 10) % 100;
    var s = parseInt(time / 1000) % 60;
    var m = parseInt(time / 60000);
    return m + "'" + s.toString().padStart(2, "0") + "'" + ms.toString().padStart(2, "0");
}

function timer() {
    time.innerHTML = formatTime(Date.now() - time0);
    timerID = requestAnimationFrame(timer);
}

function stopTimer() {
    cancelAnimationFrame(timerID);
}

/* Start Game */

var best;

function startGame() {
    game.classList.remove("idle");
    countdown.classList.remove("hidden");
    for (var i = 0; i < 4; i++) {
        countdown.children[i].classList.add("tick" + i);
    }
    banner.classList.add("hidden");
    result.classList.add("hidden");
    dynamicStyle.innerHTML = `
    #board {
        grid-template-columns: repeat(${currentBoard.width}, auto);
    }
    @media (orientation: portrait) {
        #board {
            grid-template-rows: repeat(${currentBoard.width}, auto);
        }
    }`;

    best = parseInt(localStorage.getItem(currentBoard.key)) || 0;
    record.innerHTML = formatTime(best);
    time.innerHTML = formatTime(0);

    shuffleTiles();
    setTimeout(reallyStart, 4000);
}

function reallyStart() {
    time0 = Date.now();
    timer();
    countdown.classList.add("hidden");
    for (var i = 0; i < 4; i++) {
        countdown.children[i].classList.remove("tick" + i);
    }
}

/* End Game */

function endGame() {
    stopTimer();
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
    dynamicStyle = document.getElementById("dynamic-style");

    game = document.getElementById("game");
    record = document.getElementById("record");
    time = document.getElementById("time");
    shuffle = document.getElementById("shuffle");
    board = document.getElementById("board");
    pathmap = document.getElementById("pathmap");
    countdown = document.getElementById("countdown");

    banner = document.getElementById("banner");
    sandy = document.getElementById("sandy");
    ai = document.getElementById("ai");
    start = document.getElementById("start");

    result = document.getElementById("result");
    newrecord = document.getElementById("record");
    victory = document.getElementById("victory");
    again = document.getElementById("again");

    currentBoard = new Board("tile", 18);

    shuffle.addEventListener("click", shuffleTiles);
    board.addEventListener("click", selectTile);
    start.addEventListener("click", startGame);
    again.addEventListener("click", restartGame);
}

window.addEventListener("DOMContentLoaded", init);
