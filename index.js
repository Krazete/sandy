/* Elements */

var dynamicStyle;
var game, record, time, shuffle, board, pathmap, countdown;
var banner, sandy, ai, start;
var result, newrecord, victory, time2, again;

/* Data */

var empty = [];
var ids = [];
var pid;
var matches = 0;

var w, h, n;

var currentBoard;

var timer = {
    "id": 0,
    "record": 0,
    "start": 0,
    "end": 0
};

/* Initialize Board */

function updateBoard() {
    for (var i = 0; i < 36; i++) {
        var tile = tiles[ids[i]];
        board.appendChild(tile);
        if (empty[i]) {
            tile.classList.add("invisible");
        }
        else {
            tile.classList.remove("invisible");
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

/* Timer */

function formatTime(time) {
    var m = parseInt(time / 60000);
    var s = parseInt(time / 1000) % 60;
    var c = parseInt(time / 10) % 100;

    function formatTimeSegment(t) {
        return t.toString().padStart(2, "0");
    }

    return [m, s, c].map(formatTimeSegment).join("'");
}

function startTimer() {
    timer.start = Date.now();
    updateTimer();
}

function updateTimer() {
    timer.end = Date.now();
    time.innerHTML = formatTime(timer.end - timer.start);
    timer.id = requestAnimationFrame(updateTimer);
}

function stopTimer() {
    time.innerHTML = formatTime(timer.end - timer.start);
    cancelAnimationFrame(timer.id);
}

function enableShuffle() {
    shuffle.classList.remove("disabled");
}

function shuffleTiles() {
    shuffle.classList.add("disabled");
    setTimeout(enableShuffle, 4000);

    currentBoard.shuffle();
    for (var i = 0; i < currentBoard.orderset.length; i++) {
        board.appendChild(currentBoard.tileset[currentBoard.orderset[i]]);
    }
}

/* Start Game */

function startGame() {
    dynamicStyle.innerHTML = `
    #board {
        grid-template-columns: repeat(${currentBoard.width}, auto);
    }
    @media (orientation: portrait) {
        #board {
            grid-template-rows: repeat(${currentBoard.width}, auto);
        }
    }`;
    game.classList.remove("idle");
    countdown.classList.remove("hidden");
    for (var i = 0; i < 4; i++) {
        countdown.children[i].classList.add("tick" + i);
    }
    banner.classList.add("hidden");
    result.classList.add("hidden");

    timer.record = parseInt(localStorage.getItem(currentBoard.key)) || 0;
    record.innerHTML = formatTime(timer.record);
    time.innerHTML = formatTime(0);

    shuffleTiles();
    setTimeout(startGameplay, 4000);
}

function startGameplay() {
    countdown.classList.add("hidden");
    for (var i = 0; i < 4; i++) {
        countdown.children[i].classList.remove("tick" + i);
    }

    startTimer();
}

/* End Game */

function endGame() {
    game.classList.add("idle");
    result.classList.remove("hidden");

    stopTimer();
}

/* Mode */

function changeMode() {
    if (currentBoard.key == "tile") {
        banner.classList.remove("sandy");
        banner.classList.add("ai");
        currentBoard = new Board("vtile", 20);
    }
    else if (currentBoard.key == "vtile") {
        banner.classList.add("sandy");
        banner.classList.remove("ai");
        currentBoard = new Board("tile", 18);
    }
    else {
        console.log("idk what happened");
    }
}

/* Initialize */

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
    modechanger = document.getElementById("modechanger");
    start = document.getElementById("start");

    result = document.getElementById("result");
    newrecord = document.getElementById("record");
    victory = document.getElementById("victory");
    time2 = document.getElementById("time2");
    again = document.getElementById("again");

    // window.addEventListener("load", e=>banner.classList.add("sandy"));
    currentBoard = new Board("tile", 18);

    modechanger.addEventListener("click", changeMode);
    shuffle.addEventListener("click", shuffleTiles);
    board.addEventListener("click", selectTile);
    start.addEventListener("click", startGame);
    again.addEventListener("click", startGame);
}

window.addEventListener("DOMContentLoaded", init);
