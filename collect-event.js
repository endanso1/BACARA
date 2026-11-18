
(function () {
    "use strict";

    function recordEvent(eventType, details = {}) {
        const event = {
            eventId: crypto.randomUUID
                ? crypto.randomUUID()
                : `event-${Date.now()}`,
            eventType,
            timestamp: new Date().toISOString(),
            details
        };

        const events = JSON.parse(
            localStorage.getItem("bacara_events") || "[]"
        );

        events.push(event);

        localStorage.setItem(
            "bacara_events",
            JSON.stringify(events)
        );

        console.log("BACARA interaction:", event);

        return event;
    }

    window.BACARAEvents = {
        recordEvent
    };
})();
