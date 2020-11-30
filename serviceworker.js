var CACHE = "pwacache";

var everything = [
    "/",
    "/index.html",
    "/index.css",
    "/index.js",
    "/modes.js",
    "/x.js",
    "/img/bg.png",
    "/img/banner.png",
    "/img/mic.png",
    "/img/start.png",
    "/img/3.png",
    "/img/2.png",
    "/img/1.png",
    "/img/0.png",
    "/img/record.png",
    "/img/time.png",
    "/img/selected.png",
    "/img/shuffle.png",
    "/img/result.png",
    "/img/victory.png",
    "/img/record.png",
    "/img/again.png",
    "/default/0.png",
    "/default/1.png",
    "/default/2.png",
    "/default/3.png",
    "/default/4.png",
    "/default/5.png",
    "/default/6.png",
    "/default/7.png",
    "/default/8.png",
    "/default/9.png",
    "/default/10.png",
    "/default/11.png",
    "/default/12.png",
    "/default/13.png",
    "/default/14.png",
    "/default/15.png",
    "/default/16.png",
    "/default/17.png",
    "/default/18.png",
    "/vtuber/0.png",
    "/vtuber/1.png",
    "/vtuber/2.png",
    "/vtuber/3.png",
    "/vtuber/4.png",
    "/vtuber/5.png",
    "/vtuber/6.png",
    "/vtuber/7.png",
    "/vtuber/8.png",
    "/vtuber/9.png",
    "/vtuber/10.png",
    "/vtuber/11.png",
    "/vtuber/12.png",
    "/vtuber/13.png",
    "/vtuber/14.png",
    "/vtuber/15.png",
    "/vtuber/16.png",
    "/vtuber/17.png",
    "/vtuber/18.png",
    "/vtuber/19.png",
    "/vtuber/20.png"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE).then(
            function (cache) {
                console.log("Opened cache");
                return cache.addAll(everything);
            }
        )
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(
            function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});
