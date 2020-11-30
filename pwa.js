function initPWA() {
    if ("serviceWorker" in navigator) {
        if (navigator.serviceWorker.controller) {
            console.log("Active service worker found; no need to register.");
        }
        else {
            navigator.serviceWorker.register("serviceworker.js").then(
                function (e) {
                    console.log("Service worker registered for scope:", e.scope);
                }
            ).catch(
                function (e) {
                    console.log("Service worker registration failed:", e);
                }
            );
        }
    }
}

window.addEventListener("load", initPWA);
