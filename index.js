/* Elements */

var dynamicStyle;
var game, record, time, shuffle, board, pathmap, countdown;
var banner, mascot, modechanger, rules, start;
var result, mascot2, modechanger2, newrecord, victory, time2, earned, again;

/* Data */

var currentBoard, i0, newRecordFlag;
var mode = -1;
var matches = 0;

var timer = {
    "id": 0,
    "key": "",
    "record": 0,
    "current": 0,
    "start": 0,
    "end": 0
};

/* Timer */

function formatTime(time) {
    if (time < 0) {
        return "\u2013\u2013'\u2013\u2013'\u2013\u2013";
    }

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
        var size = box.width / currentBoard.width;
        var x = scrollX + box.left + size / 2;
        var y = scrollY + box.top + size / 2;
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
        var size = box.height / currentBoard.width;
        var x = scrollX + box.right - size / 2;
        var y = scrollY + box.top + size / 2;
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

/* Game Logic */

function selectTile(e) {
    if (!("i" in e.dataset)) {
        return;
    }

    var i = parseInt(e.dataset.i);

    if (typeof i0 == "undefined") {
        currentBoard.tileset[i].classList.add("selected");
        i0 = i;
    }
    else {
        var path = currentBoard.select(i, i0);
        if (typeof path == "undefined") {
            currentBoard.tileset[i0].classList.remove("selected");
        }
        else {
            matches++;
            currentBoard.tileset[i].classList.add("selected");
            currentBoard.tileset[i0].classList.add("matched");
            currentBoard.tileset[i].classList.add("matched");
            drawPath(path);
            if (matches >= currentBoard.size) {
                endGame();
            }
        }
        i0 = undefined;
    }
}

/* Change Mode */

function changeMode() {
    mode = (mode + 1) % modes.length;

    currentBoard = new Board(modes[mode].key, modes[mode].size);

    document.body.classList.add("moded");

    mascot.classList.remove("hidden");
    mascot.style = "";
    for (var atr in modes[mode].banner) {
        mascot.style[atr] = modes[mode].banner[atr];
    }
    mascot.src = modes[mode].key + "/0.png";

    mascot2.classList.remove("hidden");
    mascot2.style = "";
    for (var atr in modes[mode].result) {
        mascot2.style[atr] = modes[mode].result[atr];
    }
    mascot2.src = modes[mode].key + "/0.png";

    updateResults();
}

/* Start Game */

function resetTiles() {
    for (var i = 0; i < currentBoard.tileset.length; i++) {
        currentBoard.tileset[i].classList.remove("selected");
        currentBoard.tileset[i].classList.remove("matched");
        currentBoard.tileset[i].classList.remove("invisible");
    }

    currentBoard.reset();

    matches = 0;
}

function disableShuffle() {
    shuffle.classList.add("disabled");
}

function enableShuffle() {
    shuffle.classList.remove("disabled");
}

function shuffleTiles() {
    disableShuffle();
    setTimeout(enableShuffle, 4000);

    if (typeof i0 != "undefined") {
        currentBoard.tileset[i0].classList.remove("selected");
        i0 = undefined;
    }

    board.innerHTML = "";
    currentBoard.shuffle();
    for (var i = 0; i < currentBoard.tilemap.length; i++) {
        board.appendChild(currentBoard.tileset[currentBoard.tilemap[i]]);
        if (!currentBoard.livemap[i]) {
            currentBoard.tileset[currentBoard.tilemap[i]].classList.add("invisible");
        }
    }
}

function resizeTiles() {
    var vmin = Math.min(innerWidth, innerHeight) / 100;
    var vmax = Math.max(innerWidth, innerHeight) / 100;
    dynamicStyle.innerHTML = `
    #board {
        grid-template-columns: repeat(${currentBoard.width}, auto);
    }
    @media (orientation: portrait) {
        #board {
            grid-template-rows: repeat(${currentBoard.width}, auto);
        }
    }
    #board > div {
        width: ${80 / currentBoard.height * vmin}px;
        height: ${80 / currentBoard.height * vmin}px;
        max-width: ${80 / currentBoard.width * vmax}px;
        max-height: ${80 / currentBoard.width * vmax}px;
    }
    #pathmap polyline:first-child {
        stroke-width: ${4 / currentBoard.height}vmin;
    }
    #pathmap polyline:last-child {
        stroke-width: ${3 / currentBoard.height}vmin;
    }
    `;
}

function startGame() {
    game.classList.remove("idle");
    countdown.classList.remove("hidden");
    for (var i = 0; i < 4; i++) {
        countdown.children[i].classList.add("tick" + i);
    }
    banner.classList.add("hidden");
    result.classList.add("hidden");

    timer.key = currentBoard.key;
    timer.record = parseInt(localStorage.getItem(timer.key)) || -1;
    record.innerHTML = formatTime(timer.record);
    time.innerHTML = formatTime(0);

    newRecordFlag = false;

    resizeTiles();
    resetTiles();
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

function updateResults() {
    if (currentBoard.key == timer.key) {
        if (newRecordFlag) {
            newrecord.classList.remove("hidden");
            victory.classList.add("hidden");
        }
        else {
            newrecord.classList.add("hidden");
            victory.classList.remove("hidden");
        }
        time2.innerHTML = formatTime(timer.current);
        earned.innerHTML = timer.current % 10;
    }
    else {
        newrecord.classList.add("hidden");
        victory.classList.add("hidden");
        time2.innerHTML = formatTime(-1);
        earned.innerHTML = "\u2013";
    }
}

function endGame() {
    game.classList.add("idle");
    result.classList.remove("hidden");

    stopTimer();

    timer.current = timer.end - timer.start;
    if (timer.current < timer.record || timer.record <= 0) {
        localStorage.setItem(timer.key, Math.floor(timer.current / 10) * 10);
        timer.record = timer.current;
        newRecordFlag = true;
    }
    updateResults();
}

/* Initialize */

function preloadImages() {
    for (var mode of modes) {
        for (var i = 0; i <= mode.size; i++) {
            var img = new Image();
            img.src = mode.key + "/" + i + ".png";
        }
    }
    var img = new Image();
    img.src = "img/selected.png";
}

function relegator(e) {
    if ("touches" in e) {
        var touch = e.touches[e.touches.length - 1];
        if (touch.target != rules) {
            e.preventDefault();
        }
        relegator(touch);
    }
    else if ("target" in e) {
        relegator(e.target);
    }
    else if (e == modechanger || e == modechanger2) {
        changeMode();
    }
    else if (e == start || e == again) {
        startGame();
    }
    else if (e == shuffle) {
        shuffleTiles();
    }
    else if ("dataset" in e && "i" in e.dataset) {
        selectTile(e);
    }
    else if (e != document.body) {
        relegator(e.parentElement);
    }
}

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
    mascot = document.getElementById("mascot");
    modechanger = document.getElementById("modechanger");
    rules = document.getElementById("rules");
    start = document.getElementById("start");

    result = document.getElementById("result");
    mascot2 = document.getElementById("mascot2");
    modechanger2 = document.getElementById("modechanger2");
    newrecord = document.getElementById("newrecord");
    victory = document.getElementById("victory");
    time2 = document.getElementById("time2");
    earned = document.getElementById("earned");
    again = document.getElementById("again");

    preloadImages();
    currentBoard = new Board(modes[0].key, modes[0].size);

    var resizeTilesDebounced = (function () {
        var timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(resizeTiles, 250);
        };
    })();

    window.addEventListener("resize", resizeTilesDebounced);
    window.addEventListener("mousedown", relegator);
    window.addEventListener("touchstart", relegator, {"passive": false});
}

window.addEventListener("DOMContentLoaded", init);
