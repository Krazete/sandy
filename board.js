var boards = {};

function getDimensions(n) { /* get nonlinear factors of 2n */
    var i, j, w, h;
    for (i = 1; i < 2 * n; i++) {
        j = 2 * n / i;
        if (i >= j) { /* must be wider than 1:1 */
            break;
        }
        if (j == Math.floor(j)) {
            w = j;
            h = i;
        }
    }
    return [w, h];
}

function manhattanDistance(a, b) {
    return Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
}

function pathLength(path) {
    var ab = manhattanDistance(path[0], path[1]);
    var bc = manhattanDistance(path[1], path[2]);
    var cd = manhattanDistance(path[2], path[3]);

    if (ab == 0 || bc == 0 || cd == 0) { /* prefer fewer segments */
        return 0;
    }

    return ab + bc + cd;
}

function shortestPaths(paths) {
    var shorts = [];
    var minlength;

    for (var i = 0; i < paths.length; i++) {
        var ilength = pathLength(paths[i]);
        if (typeof minlength == "undefined" || ilength < minlength) {
            minlength = ilength;
            shorts = [paths[i]];
        }
        else if (ilength == minlength) {
            shorts.push(paths[i]);
        }
    }

    return shorts;
}

function Board(key, size) {
    if (key in boards) {
        return boards[key];
    }

    var dimensions = getDimensions(size);

    if (typeof dimensions[0] == "undefined" || typeof dimensions[1] == "undefined") {
        return;
    }

    this.key = key;
    this.size = size;
    this.width = dimensions[0];
    this.height = dimensions[1];
    this.tileset = []; /* tileset[i] has element of tile i */
    this.tilemap = []; /* tilemap[i] has tile index of position i */
    this.livemap = []; /* livemap[i] has status of position i */

    for (var i = 0; i < 2 * size; i++) {
        var icon = document.createElement("div");
        icon.style.backgroundImage = "url('" + key + "/" + (i % size + 1) + ".png')";

        var tile = document.createElement("div");
        tile.dataset.i = i;
        tile.appendChild(icon);

        this.tileset.push(tile);
        this.tilemap.push(i);
        this.livemap.push(true);
    }

    boards[key] = this;

    return this;
}

Board.prototype.reset = function () {
    for (var i = 0; i < 2 * this.size; i++) {
        /* this.tileset is never altered by Board itself */
        this.tilemap[i] = i;
        this.livemap[i] = true;
    }
};

Board.prototype.shuffle = function () {
    var iset = [];

    for (var i = 0; i < this.livemap.length; i++) {
        if (this.livemap[i]) {
            iset.push(i);
        }
    }

    for (var i = iset.length - 1; i > 0; i--) {
        var a = iset[Math.floor(Math.random() * (i + 1))];
        var b = iset[i];
        var tilemapa = this.tilemap[a];
        this.tilemap[a] = this.tilemap[b];
        this.tilemap[b] = tilemapa;
    }
};

Board.prototype.getDomain = function (x, y) {
    var domain = [-1, this.width];

    for (var i = x - 1; i > -1; i--) {
        if (this.livemap[i + this.width * y]) {
            domain[0] = i + 1;
            break;
        }
    }

    for (var i = x + 1; i < this.width; i++) {
        if (this.livemap[i + this.width * y]) {
            domain[1] = i - 1;
            break;
        }
    }

    return domain;
};

Board.prototype.getRange = function (x, y) {
    var range = [-1, this.height];
    for (var j = y - 1; j > -1; j--) {
        if (this.livemap[x + this.width * j]) {
            range[0] = j + 1;
            break;
        }
    }

    for (var j = y + 1; j < this.height; j++) {
        if (this.livemap[x + this.width * j]) {
            range[1] = j - 1;
            break;
        }
    }

    return range;
};

Board.prototype.findPaths = function (p, q) {
    var paths = [];

    if (Math.abs(this.tilemap[q] - this.tilemap[p]) == this.size) {
        var px = p % this.width;
        var py = Math.floor(p / this.width);
        var qx = q % this.width;
        var qy = Math.floor(q / this.width);

        var pd = this.getDomain(px, py);
        var qd = this.getDomain(qx, qy);
        var domain = [Math.max(pd[0], qd[0]), Math.min(pd[1], qd[1])];

        var pr = this.getRange(px, py);
        var qr = this.getRange(qx, qy);
        var range = [Math.max(pr[0], qr[0]), Math.min(pr[1], qr[1])];

        for (var i = domain[0]; i <= domain[1]; i++) {
            for (var j = Math.min(py, qy) + 1; j < Math.max(py, qy); j++) {
                if (i >= 0 && i < this.width && j >= 0 && j < this.height && this.livemap[i + this.width * j]) {
                    break;
                }
            }
            if (j == py || j == qy) {
                paths.push([[px, py], [i, py], [i, qy], [qx, qy]]);
            }
        }

        for (var j = range[0]; j <= range[1]; j++) {
            for (var i = Math.min(px, qx) + 1; i < Math.max(px, qx); i++) {
                if (i >= 0 && i < this.width && j >= 0 && j < this.height && this.livemap[i + this.width * j]) {
                    break;
                }
            }
            if (i == px || i == qx) {
                paths.push([[px, py], [px, j], [qx, j], [qx, qy]]);
            }
        }
    }

    return shortestPaths(paths);
};

Board.prototype.select = function (i, j) {
    var p = this.tilemap.indexOf(i);
    var q = this.tilemap.indexOf(j);
    var paths = this.findPaths(p, q);
    if (paths.length > 0) {
        this.livemap[p] = false;
        this.livemap[q] = false;
    }
    return paths[Math.floor(Math.random() * paths.length)];
};
