// Everything in this file is loaded into the browser context

// CONSTANTS
const domain = window.location.origin;
let assignments = null;

// Storage helper to save and retrieve assignments from Chrome's local storage
const Storage = {
    async setAssignments(assignments) {
        await chrome.storage.local.set({
            assignments: assignments,
            updatedAt: Date.now()
        });

        console.log("Assignments saved to storage");
    },

    async getAssignments() {
        const { assignments, updatedAt } = await chrome.storage.local.get(["assignments", "updatedAt"]);

        console.log("Retrieving assignments from storage: ", assignments);

        return { assignments, updatedAt };
    }

};

console.log("Canvas Pet content.js loaded");
isDomainCanvas();

function isDomainCanvas() {
    if (location.hostname.includes("instructure.com")) {
        startExtension();
    }
}

// start the extension
function startExtension() {
    console.log("This is Canvas! Incoming Pets!");

    console.log("Page title: ", document.title);

    // Get assignments from storage or fetch from API if not available or outdated
    getAssignmentsFromStorageOrFetch(getPlannerItems).then(assignments => {
        console.log("Assignments ready for use: ", assignments);

    })
}

async function getPlannerItems() {
    // API endpoint to get planner items for a specific date range
    // filtering for incomplete items
    // limiting to 100 results per page
    const url = domain + "/api/v1/planner/items" +
        "?start_date=2026-02-04" + "&end_date=2026-02-16" +
        "&filter=incomplete_items" + "&per_page=100";

    try {
        let response = await fetch(url);

        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.statusText);
        }

        let data = await response.json();

        // Filter for assignments only
        assignments = data.filter(item => item.plannable_type === "assignment");
    }
    catch (error) {
        console.error("Error fetching planner items:", error);
    }
}

// get assignments from storage or fetch from API if not available or outdated
async function getAssignmentsFromStorageOrFetch(getPlannerItems, fetchAgainTimer = 10 * 60 * 1000) {
    const { assignments: storedAssignments, updatedAt } = await Storage.getAssignments();

    // check if we need to fetch new assignments based on the last updated time and the defined timer
    if (storedAssignments && updatedAt && (Date.now() - updatedAt < fetchAgainTimer)) {
        console.log("Using cached assignments from storage");
        assignments = storedAssignments;
    } else {
        console.log("No valid cached assignments found, fetching from API");
        await getPlannerItems();
        await Storage.setAssignments(assignments);
    }

    return assignments;
}


