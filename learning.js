
/*
 * BACARA Phase 2: Learning Session Controller
 * Prototype persistence: Browser localStorage.
 * Firebase integration will be introduced in Section 9.4.
 */

// ==========================================
// 1. DOM ELEMENTS
// ==========================================

const diagnosticForm = document.getElementById("diagnosticForm");
const assessmentForm = document.getElementById("assessmentForm");

const diagnosticSection = document.getElementById("diagnosticSection");
const activitySection = document.getElementById("activitySection");
const assessmentSection = document.getElementById("assessmentSection");
const resultsSection = document.getElementById("resultsSection");

const sessionStatus = document.getElementById("sessionStatus");

const diagnosticFeedback = document.getElementById("diagnosticFeedback");
const assessmentFeedback = document.getElementById("assessmentFeedback");

const lessonCompleted = document.getElementById("lessonCompleted");
const continueToAssessment = document.getElementById("continueToAssessment");

const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");


// ==========================================
// 2. ASSESSMENT ANSWERS
// ==========================================

const diagnosticAnswers = {
    d1: "b",
    d2: "a",
    d3: "c"
};

const postTestAnswers = {
    p1: "b",
    p2: "a",
    p3: "c"
};


// ==========================================
// 3. SESSION CREATION
// ==========================================

let session = createNewSession();

function createNewSession() {

    const sessionId =
        window.crypto && typeof window.crypto.randomUUID === "function"
            ? window.crypto.randomUUID()
            : `session-${Date.now()}`;

    return {
        sessionId: sessionId,

        learnerId: "prototype-learner",
        course: "Biology",
        lesson: "Cell Structure and Functions",

        startedAt: new Date().toISOString(),

        diagnosticScore: null,
        postTestScore: null,

        lessonCompleted: false,
        learningFormat: "2D Explanation",

        sessionCompleted: false,

        events: []
    };
}


// ==========================================
// 4. EVENT LOGGING
// ==========================================

function logEvent(eventType, details = {}) {

    const event = {
        eventType: eventType,
        timestamp: new Date().toISOString(),
        details: details
    };

    session.events.push(event);

    // Save the current session.
    localStorage.setItem(
        "bacara_current_session",
        JSON.stringify(session)
    );

    // Send the event to the analytics module if available.
    if (window.BACARAEvents &&
        typeof window.BACARAEvents.recordEvent === "function") {

        window.BACARAEvents.recordEvent(eventType, details);
    }

    console.log("BACARA Event:", event);

    return event;
}


// ==========================================
// 5. PROGRESS MANAGEMENT
// ==========================================

function updateProgress(value) {

    progressFill.style.width = `${value}%`;
    progressText.textContent = `${value}%`;
}


// ==========================================
// 6. ASSESSMENT SCORE CALCULATION
// ==========================================

function calculateScore(form, answers) {

    const formData = new FormData(form);

    let score = 0;

    Object.keys(answers).forEach(question => {

        if (formData.get(question) === answers[question]) {
            score++;
        }

    });

    return score;
}


// ==========================================
// 7. SECTION NAVIGATION
// ==========================================

function showSection(section) {

    [
        diagnosticSection,
        activitySection,
        assessmentSection,
        resultsSection

    ].forEach(item => item.classList.add("hidden"));

    section.classList.remove("hidden");

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ==========================================
// 8. LEARNER STATE CAPTURE
// ==========================================

async function captureLearnerState() {

    if (
        !window.BACARALearnerState ||
        typeof window.BACARALearnerState.buildLearnerState !== "function"
    ) {
        console.warn(
            "BACARA Learner State module is not available."
        );

        return null;
    }

    try {

        const learnerState =
            await window.BACARALearnerState.buildLearnerState(session);

        session.learnerState = learnerState;

        localStorage.setItem(
            "bacara_current_session",
            JSON.stringify(session)
        );

        console.log("BACARA Learner State:", learnerState);

        return learnerState;

    } catch (error) {

        console.error(
            "Error capturing BACARA learner state:",
            error
        );

        return null;
    }
}


// ==========================================
// 9. BEGIN LEARNING SESSION
// ==========================================

logEvent("session_started", {
    course: session.course,
    lesson: session.lesson
});


// ==========================================
// 10. STEP 1: DIAGNOSTIC ASSESSMENT
// ==========================================

diagnosticForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const score = calculateScore(
        diagnosticForm,
        diagnosticAnswers
    );

    session.diagnosticScore = score;

    logEvent("diagnostic_completed", {
        score: score,
        totalQuestions: 3
    });

    diagnosticFeedback.textContent =
        `You scored ${score} out of 3. Your initial knowledge assessment has been recorded.`;

    sessionStatus.textContent = "Diagnostic completed";

    updateProgress(25);

    setTimeout(() => {

        showSection(activitySection);

        sessionStatus.textContent = "Learning in progress";

    }, 900);

});


// ==========================================
// 11. STEP 2: LEARNING ACTIVITY
// ==========================================

lessonCompleted.addEventListener("change", function() {

    continueToAssessment.disabled = !lessonCompleted.checked;

    if (lessonCompleted.checked) {

        logEvent("learning_activity_completed", {
            lesson: session.lesson,
            learningFormat: session.learningFormat
        });

    }

});


continueToAssessment.addEventListener("click", function() {

    if (!lessonCompleted.checked) {
        return;
    }

    session.lessonCompleted = true;

    updateProgress(50);

    logEvent("assessment_started", {
        assessmentType: "post-learning"
    });

    showSection(assessmentSection);

    sessionStatus.textContent = "Post-test in progress";

});


// ==========================================
// 12. STEP 3: POST-LEARNING ASSESSMENT
// ==========================================

assessmentForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const score = calculateScore(
        assessmentForm,
        postTestAnswers
    );

    session.postTestScore = score;

    logEvent("post_test_completed", {
        score: score,
        totalQuestions: 3
    });

    assessmentFeedback.textContent =
        `You scored ${score} out of 3. Your post-learning result has been recorded.`;

    setTimeout(() => {

        finishSession();

    }, 900);

});


// ==========================================
// 13. STEP 4: FINISH SESSION
// ==========================================

async function finishSession() {

    const initialPercentage =
        (session.diagnosticScore / 3) * 100;

    const finalPercentage =
        (session.postTestScore / 3) * 100;

    const knowledgeChange =
        finalPercentage - initialPercentage;

    // Display assessment scores.
    document.getElementById("initialScore").textContent =
        `${session.diagnosticScore}/3`;

    document.getElementById("finalScore").textContent =
        `${session.postTestScore}/3`;

    document.getElementById("improvement").textContent =
        `${knowledgeChange > 0 ? "+" : ""}${knowledgeChange.toFixed(1)}%`;

    // Display learner feedback.
    document.getElementById("finalMessage").textContent =

        knowledgeChange > 0
            ? "Your assessment score increased after the learning activity."

            : knowledgeChange === 0
                ? "Your assessment score remained the same. Further practice may help."

                : "Your post-test score was lower than your diagnostic score. Review the lesson and try again.";

    session.completedAt = new Date().toISOString();

    session.sessionCompleted = true;

    // Record session completion.
    logEvent("session_completed", {
        diagnosticScore: session.diagnosticScore,
        postTestScore: session.postTestScore,
        knowledgeChange: knowledgeChange
    });

    // Capture learner state BEFORE saving session history.
    await captureLearnerState();

    // Update progress and interface.
    updateProgress(100);

    sessionStatus.textContent = "Session completed";

    showSection(resultsSection);

    // Save completed session.
    saveSessionToHistory();

}


// ==========================================
// 14. SAVE SESSION HISTORY
// ==========================================

function saveSessionToHistory() {

    const history = JSON.parse(
        localStorage.getItem("bacara_session_history") || "[]"
    );

    history.push(session);

    localStorage.setItem(
        "bacara_session_history",
        JSON.stringify(history)
    );

    console.log("BACARA Session History:", history);

}


// ==========================================
// 15. RESTART LEARNING SESSION
// ==========================================

document.getElementById("restartSession").addEventListener("click", function() {

    session = createNewSession();

    // Reset assessment forms.
    diagnosticForm.reset();
    assessmentForm.reset();

    // Reset lesson completion.
    lessonCompleted.checked = false;

    continueToAssessment.disabled = true;

    // Clear previous feedback.
    diagnosticFeedback.textContent = "";
    assessmentFeedback.textContent = "";

    // Reset progress.
    updateProgress(0);

    sessionStatus.textContent = "Not started";

    // Start a fresh session.
    logEvent("session_restarted", {
        previousSessionCompleted: true
    });

    showSection(diagnosticSection);

});
