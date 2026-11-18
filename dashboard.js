
document.addEventListener("DOMContentLoaded", () => {

    // Detect browser
    const userAgent = navigator.userAgent;

    let browser = "Unknown";

    if (userAgent.includes("Edg/")) {
        browser = "Microsoft Edge";
    } else if (userAgent.includes("Chrome/")) {
        browser = "Google Chrome";
    } else if (userAgent.includes("Firefox/")) {
        browser = "Mozilla Firefox";
    } else if (userAgent.includes("Safari/")) {
        browser = "Safari";
    }

    document.getElementById("browserValue").textContent = browser;

    // Detect screen dimensions
    const deviceWidth = window.screen.width;
    const deviceHeight = window.screen.height;

    document.getElementById("deviceValue").textContent =
        `${deviceWidth} × ${deviceHeight}`;

    // Detect network information where supported
    const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

    if (connection) {

        document.getElementById("connectionType").textContent =
            connection.type || "Not reported";

        document.getElementById("bandwidthValue").textContent =
            connection.downlink
                ? connection.downlink + " Mbps"
                : "Not reported";

        connection.addEventListener("change", () => {

            document.getElementById("bandwidthValue").textContent =
                connection.downlink
                    ? connection.downlink + " Mbps"
                    : "Not reported";

        });

    } else {

        document.getElementById("connectionType").textContent =
            "Browser unavailable";

        document.getElementById("bandwidthValue").textContent =
            "Not supported";

    }

});
