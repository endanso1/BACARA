
(function () {
    "use strict";

    function getBrowserInformation() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            online: navigator.onLine,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            pixelRatio: window.devicePixelRatio || 1
        };
    }

    function getNetworkInformation() {
        const connection =
            navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;

        if (!connection) {
            return {
                available: false,
                bandwidthMbps: null,
                effectiveType: "unknown",
                rttMs: null
            };
        }

        return {
            available: true,
            bandwidthMbps:
                typeof connection.downlink === "number"
                    ? connection.downlink
                    : null,

            effectiveType: connection.effectiveType || "unknown",

            rttMs:
                typeof connection.rtt === "number"
                    ? connection.rtt
                    : null
        };
    }

    async function checkWebXRSupport() {
        if (!navigator.xr) {
            return {
                available: false,
                immersiveVR: false
            };
        }

        try {
            const supported =
                await navigator.xr.isSessionSupported("immersive-vr");

            return {
                available: true,
                immersiveVR: supported
            };
        } catch (error) {
            return {
                available: true,
                immersiveVR: false,
                error: error.message
            };
        }
    }

    async function buildLearnerState(session) {
        const network = getNetworkInformation();
        const browser = getBrowserInformation();
        const webxr = await checkWebXRSupport();

        // Knowledge from the diagnostic assessment.
        const knowledge =
            session.diagnosticScore !== null
                ? session.diagnosticScore / 3
                : null;

        // Record observable engagement indicators.
        // These are not yet a validated engagement score.
        const engagement = {
            lessonCompleted: session.lessonCompleted,
            interactionCount: session.events.length,
            eventTypes: session.events.map(
                event => event.eventType
            )
        };

        // Cognitive load requires a defined instrument or model.
        const cognitiveLoad = null;

        // Device capability is not fully established by browser detection.
        const deviceCapability = {
            browserInformation: browser,
            webxrSupport: webxr,
            performanceAssessment: "not_measured"
        };

        const state = {
            knowledge,

            engagement,

            cognitiveLoad,

            bandwidth: network.bandwidthMbps,

            latency: network.rttMs,

            deviceCapability,

            networkInformation: network,

            collectedAt: new Date().toISOString()
        };

        return state;
    }

    window.BACARALearnerState = {
        buildLearnerState,
        getBrowserInformation,
        getNetworkInformation,
        checkWebXRSupport
    };
})();
