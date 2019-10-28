var board;
var empty = [];
var tiles = [];
var selected;

function newTile(n) {
    var tile = document.createElement("div");
    tile.className = "tile";
    var icon = document.createElement("img");
    icon.src = "tile/" + n + ".png";
    tile.appendChild(icon);
    return tile;
}

function initTiles() {
    for (var k = 0; k < 36; k++) {
        empty.push(false);
        tiles.push({
            "id": k,
            "element": newTile(k % 18 + 1)
        });
    }
}

function shuffle() {
    var ks = []
    for (var k = 0; k < 36; k++) {
        if (!empty[k]) {
            ks.push(k);
        }
    }
    for (var l = ks.length - 1; l > 0; l--) {
        var m = ks[l];
        var n = ks[Math.floor(Math.random() * (l + 1))];
        var tilesm = tiles[m];
        tiles[m] = tiles[n];
        tiles[n] = tilesm;
    }
}

function hscan(x, y) {
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

function vscan(x, y) {
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

function trace(p, q) {
    var solutions = [];

    var px = p % 9;
    var py = Math.floor(p / 9);
    var qx = q % 9;
    var qy = Math.floor(q / 9);
    var dx = qx - px < 0 ? -1 : 1;
    var dy = qy - py < 0 ? -1 : 1;

    var ph = hscan(px, py);
    var qh = hscan(qx, qy);
    for (var i = qh[0]; dx > 0 ? i <= ph[1] : i >= ph[1]; i += dx) {
        for (var j = py; dy > 0 ? j <= qy : j >= qy; j += dy) {
            var k = i + 9 * j;
            if (!(i < 0 || i >= 9 || j < 0 || j >= 4 || empty[k] || k == p || k == q)) {
                break;
            }
        }
        if (j - dy == qy) {
            solutions.push([[px, py], [i, py], [i, qy], [qx, qy]]);
        }
    }
    var pv = vscan(px, py);
    var qv = vscan(qx, qy);
    for (var j = qv[0]; dy > 0 ? j <= pv[1] : j >= pv[1]; j += dy) {
        for (var i = px; dx > 0 ? i <= qx : i >= qx; i += dx) {
            var k = i + 9 * j;
            if (!(i < 0 || i >= 9 || j < 0 || j >= 4 || empty[k] || k == p || k == q)) {
                break;
            }
        }
        if (i - dx == qx) {
            solutions.push([[px, py], [px, j], [qx, j], [qx, qy]]);
        }
    }

    if (solutions.length) {
        empty[p] = true;
        empty[q] = true;
    }

    return solutions[Math.floor(Math.random() * solutions.length)];
}

function match(p, q) {
    if (tiles[p] % 18 == tiles[q] % 18) {
        var solution = trace(p, q);
    }
}

function updateBoard() {
    board.innerHTML = "";
    for (var k = 0; k < 36; k++) {
        var tile = tiles[k];
        board.appendChild(tile.element);
        if (empty[k]) {
            tile.element.classList.add("hidden");
        }
        else {
            tile.element.classList.remove("hidden");
        }
    }
}

var linelayer;

function layline() {
    for (var polyline of linelayer.children) {
        polyline.setAttribute("points", "50,300 500,300 500,50 900,50");
    }
}

function animateMatch() {
    match(selected, tile);
}

function select(tile) {
    if (tile.classList.contains("tile")) {
        if (selected) {
            if (selected == tile) {
                tile.classList.remove("selected");
            }
            else {
                tile.classList.add("selected");
                animateMatch(selected, tile);
            }
            selected = undefined;
        }
        else {
            tile.classList.add("selected");
            selected = tile;
        }
    }
    else if (tile.id != "board") {
        select(tile.parentElement);
    }
}

function onBoardClick(e) {
    select(e.target);
}

function init() {
    linelayer = document.getElementById("linelayer");
    board = document.getElementById("board");
    board.addEventListener("click", onBoardClick);
    initTiles();
    test();
}

window.addEventListener("DOMContentLoaded", init);

function test() {
    for (var i = 1; i < 8; i++) {
        empty[i] = true;
    }
    for (var i = 0; i < 3; i++) {
        empty[4 + i * 9] = true;
    }
    match(7 + 9 * 1, 4 + 9 * 3);
    shuffle();
    updateBoard();
}
