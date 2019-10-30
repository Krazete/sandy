/* Elements */

var board;
var tiles = [];

/* Data */

var empty = [];
var ids = [];
var selected;

function newTile(n) {
    var tile = document.createElement("div");
    tile.id = n;
    tile.className = "tile";
    var icon = document.createElement("img");
    icon.src = "tile/" + (n % 18 + 1) + ".png";
    tile.appendChild(icon);
    return tile;
}

function initTiles() {
    for (var k = 0; k < 36; k++) {
        empty.push(false);
        ids.push(k);
        tiles.push(newTile(k));
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
        var idsm = ids[m];
        ids[m] = ids[n];
        ids[n] = idsm;
    }
}

function updateBoard() {
    board.innerHTML = "";
    for (var k = 0; k < 36; k++) {
        var tile = tiles[ids[k]];
        board.appendChild(tile);
        if (empty[k]) {
            tile.classList.add("hidden");
        }
        else {
            tile.classList.remove("hidden");
        }
    }
}

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

function solve(p, q) {
    var solutions = [];

    var px = p % 9;
    var py = Math.floor(p / 9);
    var qx = q % 9;
    var qy = Math.floor(q / 9);

    var pd = getDomain(px, py);
    var qd = getDomain(qx, qy);
    var domain = [Math.max(pd[0], qd[0]), Math.min(pd[1], qd[1])];
    for (var i = domain[0]; i <= domain[1]; i++) {
        var interrupted = false;
        for (var j = Math.min(py, qy) + 1; j < Math.max(py, qy); j++) {
            var k = i + 9 * j;
            if (!(i < 0 || i > 8 || j < 0 || j > 3 || empty[k])) {
                break;
            }
        }
        if (j == py || j == qy) {
            solutions.push([[px, py], [i, py], [i, qy], [qx, qy]]);
        }
    }
    var pr = getRange(px, py);
    var qr = getRange(qx, qy);
    var range = [Math.max(pr[0], qr[0]), Math.min(pr[1], qr[1])];
    for (var j = range[0]; j <= range[1]; j++) {
        var interrupted = false;
        for (var i = Math.min(px, qx) + 1; i < Math.max(px, qx); i++) {
            var k = i + 9 * j;
            if (!(i < 0 || i > 8 || j < 0 || j > 3 || empty[k])) {
                break;
            }
        }
        if (i == px || i == qx) {
            solutions.push([[px, py], [px, j], [qx, j], [qx, qy]]);
        }
    }

    if (solutions.length) {
        empty[p] = true;
        empty[q] = true;
    }

    return solutions;
}

var linelayer;

// function getCentroid(tile) {
//     var box = tile.getBoundingClientRect();
//     return [(box.left + box.right) / 2, (box.top + box.bottom) / 2];
// }

// function layline(ks) {
//     for (var polyline of linelayer.children) {
//         console.log(ks);
//         polyline.setAttribute("points", [
//             getCentroid(tiles[ks[0]]),
//             getCentroid(tiles[ks[1]]),
//             getCentroid(tiles[ks[2]]),
//             getCentroid(tiles[ks[3]])
//         ].join(" "));
//     }
// }

function animateMatch(p, q) {
    updateBoard();
}

function match(selected, id) {
    if (selected % 18 == id % 18 && selected != id) {
        var p = ids.indexOf(selected);
        var q = ids.indexOf(id);
        var solutions = solve(p, q);
        if (solutions.length) {
            // var solution = solutions[Math.floor(Math.random() * solutions.length)];
            for (var i = 0; i < solutions.length; i++) {
                var solution = solutions[i];
                console.log(solution);
            }
            return true;
        }
        return false;
    }
    return false;
}

function select(tile) {
    if (tile.target) {
        tile = tile.target;
    }
    var id = parseInt(tile.id);
    if (tile.classList.contains("tile")) {
        if (selected) {
            if (match(selected, id)) {
                tile.classList.add("selected");
                animateMatch(selected, id); // maybe put in match()
            }
            else {
                tiles[selected].classList.remove("selected");
            }
            selected = undefined;
        }
        else {
            tile.classList.add("selected");
            selected = id;
        }
    }
    else if (tile.id != "board") {
        select(tile.parentElement);
    }
}

function init() {
    linelayer = document.getElementById("linelayer");
    board = document.getElementById("board");
    board.addEventListener("click", select);
    initTiles();
    shuffle();
    updateBoard();
}

window.addEventListener("DOMContentLoaded", init);
