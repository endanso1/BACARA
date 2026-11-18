
(function () {
    "use strict";

    // Validate values that are expected to be between 0 and 1.
    function normalisePercentage(value) {
        if (
            typeof value !== "number" ||
            !Number.isFinite(value)
        ) {
            return null;
        }

        return Math.max(0, Math.min(1, value));
    }

    // Convert a normalised value into a category.
    // Thresholds must be supplied and justified by the research.
    function categorise(value, thresholds) {
        if (value === null || value === undefined) {
            return "unavailable";
        }

        if (
            !thresholds ||
            typeof thresholds.low !== "number" ||
            typeof thresholds.high !== "number" ||
            thresholds.low >= thresholds.high
        ) {
            return "thresholds_not_configured";
        }

        if (value < thresholds.low) return "low";
        if (value < thresholds.high) return "medium";

        return "high";
    }

    window.BACARANormalise = {
        normalisePercentage,
        categorise
    };
})();
