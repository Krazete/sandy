/* Elements */

var shuffle;
var board;
var tiles = [];
var pathmap;

/* Data */

var empty = [];
var ids = [];
var pid;

/* Initialize Board */

function newTile(id) {
    var tile = document.createElement("div");
    var icon = document.createElement("img");
    tile.id = id;
    tile.className = "tile";
    icon.src = "tile/" + (id % 18 + 1) + ".png";
    tile.appendChild(icon);
    return tile;
}

function initTiles() {
    for (var id = 0; id < 36; id++) {
        empty.push(false);
        ids.push(id);
        tiles.push(newTile(id));
    }
}

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

function shuffleTiles() {
    var nonempty = []
    for (var i = 0; i < 36; i++) {
        if (!empty[i]) {
            nonempty.push(i);
        }
    }
    for (var i = nonempty.length - 1; i > 0; i--) {
        var a = nonempty[i];
        var b = nonempty[Math.floor(Math.random() * (i + 1))];
        var idsa = ids[a];
        ids[a] = ids[b];
        ids[b] = idsa;
    }
    updateBoard();
    disableShuffle();
    setTimeout(enableShuffle, 3000);
}

/* Path Finding */

function getDomain(x, y) {
    var domain = [-1, 9];
    for (var i = x - 1; i > -1; i--) {
        if (!empty[i + 9 * y]) {
            domain[0] = i + 1;
            break;
        }
    }
    for (var i = x + 1; i < 9; i++) {
        if (!empty[i + 9 * y]) {
            domain[1] = i - 1;
            break;
        }
    }
    return domain;
}

function getRange(x, y) {
    var range = [-1, 4];
    for (var j = y - 1; j > -1; j--) {
        if (!empty[x + 9 * j]) {
            range[0] = j + 1;
            break;
        }
    }
    for (var j = y + 1; j < 4; j++) {
        if (!empty[x + 9 * j]) {
            range[1] = j - 1;
            break;
        }
    }
    return range;
}

function findPaths(p, q) {
    var paths = [];

    var px = p % 9;
    var py = Math.floor(p / 9);
    var qx = q % 9;
    var qy = Math.floor(q / 9);

    var pd = getDomain(px, py);
    var qd = getDomain(qx, qy);
    var domain = [Math.max(pd[0], qd[0]), Math.min(pd[1], qd[1])];

    var pr = getRange(px, py);
    var qr = getRange(qx, qy);
    var range = [Math.max(pr[0], qr[0]), Math.min(pr[1], qr[1])];

    for (var i = domain[0]; i <= domain[1]; i++) {
        for (var j = Math.min(py, qy) + 1; j < Math.max(py, qy); j++) {
            var k = i + 9 * j;
            if (!(i < 0 || i > 8 || j < 0 || j > 3 || empty[k])) {
                break;
            }
        }
        if (j == py || j == qy) {
            paths.push([[px, py], [i, py], [i, qy], [qx, qy]]);
        }
    }
    for (var j = range[0]; j <= range[1]; j++) {
        for (var i = Math.min(px, qx) + 1; i < Math.max(px, qx); i++) {
            var k = i + 9 * j;
            if (!(i < 0 || i > 8 || j < 0 || j > 3 || empty[k])) {
                break;
            }
        }
        if (i == px || i == qx) {
            paths.push([[px, py], [px, j], [qx, j], [qx, qy]]);
        }
    }
    if (paths.length) {
        empty[p] = true;
        empty[q] = true;
    }
    return paths;
}

/* Path Trimming */

function lineLength(p, q) {
    /* p and q form a non-diagonal line */
    return Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]);
}

function pathLength(path) {
    var a = lineLength(path[0], path[1]);
    var b = lineLength(path[1], path[2]);
    var c = lineLength(path[2], path[3]);
    if (a == 0 || b == 0 || c == 0) { /* prefer fewer corners */
        return 0;
    }
    return a + b + c;
}

function byLength(path1, path2) {
    return pathLength(path1) - pathLength(path2);
}

function trimPaths(paths) { /* mutating function */
    paths.sort(byLength);
    var minlength = pathLength(paths[0]);
    for (var i = paths.length - 1; i >= 0; i--) {
        if (pathLength(paths[i]) > minlength) {
            paths.pop();
        }
        else {
            break;
        }
    }
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
        for (var polyline of pathmap.children) {
            polyline.setAttribute("points", [
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
        for (var polyline of pathmap.children) {
            polyline.setAttribute("points", [
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
            if (pid != qid && pid % 18 == qid % 18 && paths.length) { /* valid match */
                tile.classList.add("selected");
                tile.classList.add("matched");
                tiles[pid].classList.add("matched");
                trimPaths(paths);
                drawPath(paths[Math.floor(Math.random() * paths.length)]);
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

/* Initialize Listeners */

function init() {
    shuffle = document.getElementById("shuffle");
    board = document.getElementById("board");
    pathmap = document.getElementById("pathmap");

    shuffle.addEventListener("click", shuffleTiles);
    board.addEventListener("click", select);

    initTiles();
    shuffleTiles();
}

window.addEventListener("DOMContentLoaded", init);
