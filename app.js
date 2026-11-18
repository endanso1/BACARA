
document.addEventListener("DOMContentLoaded", () => {

    const navigationLinks = document.querySelectorAll(".nav-link");
    const pages = document.querySelectorAll(".page-section");

    const heading = document.getElementById("pageHeading");
    const subtitle = document.getElementById("pageSubtitle");

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.getElementById("sidebar");

    const pageInformation = {
        overview: ["Dashboard Overview", "Welcome back! Continue your learning journey."],
        courses: ["My Courses", "Explore your STEM learning modules."],
        assessments: ["Assessments", "Evaluate your learning progress."],
        progress: ["My Progress", "Review your learning achievements."],
        adaptive: ["BACARA Engine", "Intelligent instructional decision-making."],
        network: ["Network Monitor", "Monitor your learning environment."],
        analytics: ["Learning Analytics", "Explore your learning performance."],
        settings: ["Settings", "Manage your application preferences."]
    };

    function showPage(pageId) {

        const targetPage = document.getElementById(pageId);

        if (!targetPage) return;

        pages.forEach(page => {
            page.classList.remove("active");
        });

        targetPage.classList.add("active");

        navigationLinks.forEach(link => {
            link.classList.toggle(
                "active",
                link.dataset.page === pageId
            );
        });

        const info = pageInformation[pageId];

        if (info) {
            heading.textContent = info[0];
            subtitle.textContent = info[1];
        }

        sidebar.classList.remove("open");

        if (window.lucide) lucide.createIcons();
    }

    navigationLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const pageId = link.dataset.page;

            showPage(pageId);

            history.replaceState(null, "", "#" + pageId);
        });

    });

    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    document.getElementById("exploreBtn").addEventListener("click", () => {
        showPage("courses");
        history.replaceState(null, "", "#courses");
    });

    document.getElementById("engineBtn").addEventListener("click", () => {
        showPage("adaptive");
        history.replaceState(null, "", "#adaptive");
    });

    document.getElementById("helpBtn").addEventListener("click", () => {
        alert("BACARA Learning Support: Assistance will be available here.");
    });

    document.getElementById("notificationBtn").addEventListener("click", () => {
        alert("You currently have no new notifications.");
    });

    const initialPage = location.hash.substring(1);

    if (pageInformation[initialPage]) {
        showPage(initialPage);
    }

});
