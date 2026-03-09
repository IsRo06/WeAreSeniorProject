// Everything in this file is loaded into the browser context
//kskskkskks
// CONSTANTS
const domain = window.location.origin;
let assignments = [];
let pet = {
    mood: "happy",
    wellbeing: "good",
}

// Storage helper to save and retrieve assignments from Chrome's local storage
const Storage = {
    async setAssignments(assignments) {
        await chrome.storage.local.set({
            assignments: assignments,
            updatedAt: Date.now(),
        });

        console.log("Assignments saved to storage");
    },

    async getAssignments() {
        const { assignments, updatedAt } = await chrome.storage.local.get([
            "assignments",
            "updatedAt",
        ]);

        console.log("Retrieving assignments from storage: ", assignments);

        return { assignments, updatedAt };
    },
};

let isDog = false;

console.log("Canvas Pet content.js loaded");

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.dogSelected) {
        const newValue = changes.dogSelected.newValue;
        isDog = newValue;
        console.log("Is Dog: " + isDog);
    }
});

isDomainCanvas();

function isDomainCanvas() {
    if (location.hostname.includes("instructure.com")) {
        startExtension();
    }
}

function hideTodo() {
    const style = document.createElement("style");
    style.id = "hide-canvas-todo";
    style.textContent = `
    #right-side { display: none !important; }
  `;
    document.head.appendChild(style);
}

function organizeAssignments(assignments) {
    const now = new Date();
    let toDoAssignments = [];
    let overdueAssignments = [];

    if (!Array.isArray(assignments)) assignments = [];

    for (let assignment of assignments) {
        let dueDate = new Date(assignment.plannable_date);
        if (dueDate < now) {
            console.log(assignment);
            overdueAssignments.push(assignment);
        } else {
            toDoAssignments.push(assignment);
        }
    }

    return { toDoAssignments, overdueAssignments };
}

// start the extension
function startExtension() {
    console.log("This is Canvas! Incoming Pets!");

    console.log("Page title: ", document.title);

    hideTodo();

    chrome.storage.local.get(["pet"], (result) => {
        if (result.pet) {
            pet = result.pet;

            const moodToggle = document.getElementById("moodToggle");
            moodToggle.checked = pet.mood === "happy";

            updatePet(moodToggle, document.getElementById("petImg"));
        }
    });

    // Get assignments from storage or fetch from API if not available or outdated
    getAssignmentsFromStorageOrFetch().then((result) => {
        assignments = result;
        console.log("Assignments ready for use: ", assignments);
    });
}

async function getPlannerItems() {
    // API endpoint to get planner items for a specific date range
    // filtering for incomplete items
    // limiting to 100 results per page
    const url =
        domain +
        "/api/v1/planner/items" +
        "?start_date=2026-02-04" +
        "&end_date=2026-03-16" +
        "&filter=incomplete_items" +
        "&per_page=100";

    try {
        let response = await fetch(url);

        if (!response.ok) {
            throw new Error("Network response was not ok: " + response.statusText);
        }

        const data = await response.json();

        // Filter for assignments only
        rawAssignments = data.filter((item) => item.plannable_type === "assignment");

        // Normalize the assignment data
        assignments = await Promise.all(rawAssignments.map(normalizeAssignment)
        );

        console.log("Fetched and normalized assignments: ", assignments);

        return assignments;

    } catch (error) {
        console.error("Error fetching planner items:", error);
    }
}

// Normalize assignments
async function normalizeAssignment(item) {
    return {
        id: item.plannable_id,
        title: item.plannable?.title || "Untitled",
        dueAt: item.plannable?.due_at || null,
        course: item.context_name || "No Course",
        whyImportant: null, // only generate if the user clicks on the assignment, to save API calls
        completed: false
    };
}

// get assignments from storage or fetch from API if not available or outdated
async function getAssignmentsFromStorageOrFetch(
    fetchAgainTimer = 10 * 60 * 1000
) {
    const { assignments: storedAssignments, updatedAt } =
        await Storage.getAssignments();

    // check if we need to fetch new assignments based on the last updated time and the defined timer
    if (
        storedAssignments &&
        updatedAt &&
        Date.now() - updatedAt < fetchAgainTimer
    ) {
        console.log("Using cached assignments from storage");
        assignments = storedAssignments;
    } else {
        console.log("No valid cached assignments found, fetching from API");
        await getPlannerItems();
        await Storage.setAssignments(assignments);
    }

    return assignments;
}

function getAnimalPaths() {
    const catNormalPath = chrome.runtime.getURL("/Images/Cat/CatWagTail.gif");
    const catHappyPath = chrome.runtime.getURL("/Images/Cat/CatHappy.gif");
    const dogNormalPath = chrome.runtime.getURL("/Images/Dog/DogTailWag.gif");
    const dogHappyPath = chrome.runtime.getURL("/Images/Dog/Happy Dog.gif");

    return {
        cat: {
            normal: catNormalPath,
            happy: catHappyPath,
        },
        dog: {
            normal: dogNormalPath,
            happy: dogHappyPath,
        },
    };
}

function renderCanvasPets(element) {
    if (!element) {
        return;
    }

    const canvasPets = document.createElement("div");
    const title = document.createElement("h2");

    const petImages = createPetImages();
    const petStats = createPetStats();
    const toDoList = createToDoList();

    title.textContent = "Welcome to Canvas Pets!";
    title.style.textAlign = "center";

    canvasPets.appendChild(title);
    canvasPets.appendChild(petImages);
    canvasPets.appendChild(petStats);
    canvasPets.appendChild(toDoList);

    element.insertAdjacentElement("beforebegin", canvasPets);
}

function createPetImages() {
    const parentDoc = document.createElement("div");

    const petScene = document.createElement("div");

    const motivationMsg = document.createElement("p");
    const petImg = document.createElement("img");

    const petRefreshBtn = document.createElement("button");
    const petMotivateBtn = document.createElement("button");
    const spacer = document.createElement("br");

    const moodToggleLabel = document.createElement("label");
    const moodToggleCheck = document.createElement("input");

    motivationMsg.textContent = "I am motivating!";
    motivationMsg.id = "pet-motivation-msg";

    parentDoc.style.backgroundColor = "#ffa362";
    parentDoc.style.borderRadius = "5px";
    parentDoc.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
    parentDoc.style.padding = "5px";
    parentDoc.style.margin = "10px";

    petScene.style.backgroundColor = "#FFF585";
    petScene.style.padding = "10px";
    petScene.style.borderRadius = "5px";

    motivationMsg.style.backgroundColor = "white";
    motivationMsg.style.borderRadius = "8px";
    motivationMsg.style.padding = "8px";
    motivationMsg.style.margin = "8px auto";
    motivationMsg.style.maxWidth = "260px";
    motivationMsg.style.maxHeight = "120px";
    motivationMsg.style.overflowY = "auto";
    motivationMsg.style.lineHeight = "1.4";
    motivationMsg.style.fontSize = "13px";
    motivationMsg.style.boxSizing = "border-box";

    const animalPaths = getAnimalPaths();
    petImg.alt = "Image of cat wagging tail";
    petImg.id = "petImg";

    petRefreshBtn.style.backgroundColor = "#FFF585";
    petRefreshBtn.style.border = "none";
    petRefreshBtn.style.borderRadius = "5px";
    petRefreshBtn.style.color = "#000";
    petRefreshBtn.style.padding = "10px";
    petRefreshBtn.style.textAlign = "center";
    petRefreshBtn.style.cursor = "pointer";
    petRefreshBtn.style.marginLeft = "auto";
    petRefreshBtn.style.marginRight = "auto";
    petRefreshBtn.style.marginTop = "4px";
    petRefreshBtn.textContent = "Refresh Pet!";

    petMotivateBtn.style.backgroundColor = "#FFF585";
    petMotivateBtn.style.border = "none";
    petMotivateBtn.style.borderRadius = "5px";
    petMotivateBtn.style.color = "#000";
    petMotivateBtn.style.padding = "10px";
    petMotivateBtn.style.textAlign = "center";
    petMotivateBtn.style.cursor = "pointer";
    petMotivateBtn.style.marginLeft = "auto";
    petMotivateBtn.style.marginRight = "auto";
    petMotivateBtn.style.marginTop = "4px";
    petMotivateBtn.textContent = "Get Motivation!";

    moodToggleLabel.for = "moodToggle";
    moodToggleLabel.textContent = "Happy";
    moodToggleCheck.type = "checkbox";
    moodToggleCheck.id = "moodToggle";
    updatePet(moodToggleCheck, petImg);

    moodToggleCheck.addEventListener("change", async () => {
        updatePet(moodToggleCheck, petImg);

        pet.mood = moodToggleCheck.checked ? "happy" : "neutral";
        await chrome.storage.local.set({ petMood: pet.mood });
    });

    petRefreshBtn.addEventListener("click", () => {
        updatePet(moodToggleCheck, petImg);
    });

    petMotivateBtn.addEventListener("click", () => {
        PromptLLM(motivationMsg);
    });

    parentDoc.appendChild(petScene);
    petScene.appendChild(motivationMsg);
    petScene.appendChild(petImg);
    parentDoc.appendChild(petRefreshBtn);
    parentDoc.appendChild(petMotivateBtn);
    parentDoc.appendChild(spacer);
    parentDoc.appendChild(moodToggleCheck);
    parentDoc.appendChild(moodToggleLabel);

    return parentDoc;
}

function createToDoList() {
    const parentDoc = document.createElement("div");

    const header = document.createElement("h3");

    parentDoc.style.backgroundColor = "#ffa362";
    parentDoc.style.borderRadius = "5px";
    parentDoc.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
    parentDoc.style.paddingTop = "12px";
    parentDoc.style.paddingLeft = "12px";
    parentDoc.style.paddingRight = "12px";
    parentDoc.style.paddingBottom = "250px";
    parentDoc.style.margin = "10px";

    parentDoc.style.display = "flex";
    parentDoc.style.flexDirection = "column";
    parentDoc.style.alignItems = "center";
    parentDoc.style.justifyContent = "flex-start";

    header.textContent = "Upcoming Assignments";
    header.style.textAlign = "center";
    header.style.margin = "0";
    header.style.color = "white";

    parentDoc.appendChild(header);


    getAssignmentsFromStorageOrFetch().then((result) => {
        assignments = result;

        const { toDoAssignments } = organizeAssignments(assignments);

        toDoAssignments
            .filter((a) => isWithinNext7Days(a.dueAt))
            .forEach((a) => {
                const card = document.createElement("div");
                const title = document.createElement("div");
                const due = document.createElement("div");

                title.textContent = a.title || "Untitled";

                const dueDate = new Date(a.dueAt);
                const dueDateDisplay = "Due: " + dueDate.toLocaleDateString();
                due.textContent = dueDateDisplay.slice(0, -5);

                card.style.backgroundColor = "#ff8f3f";
                card.style.borderRadius = "5px";
                card.style.padding = "8px 10px";
                card.style.marginTop = "8px";
                card.style.width = "100%";
                card.style.color = "white";
                card.style.boxSizing = "border-box";

                card.style.display = "flex";
                card.style.justifyContent = "space-between";
                card.style.alignItems = "flex-start";
                card.style.transition = "background-color 0.2s ease";
                card.style.cursor = "pointer";

                due.style.fontSize = "12px";
                due.style.opacity = "0.9";

                card.appendChild(title);
                card.appendChild(due);
                parentDoc.appendChild(card);

                card.addEventListener("click", async () => {
                    await handleAssignmentClick(a.id);
                });

                card.addEventListener("mouseenter", () => {
                    card.style.backgroundColor = "#ff7a1f";
                });

                card.addEventListener("mouseleave", () => {
                    card.style.backgroundColor = "#ff8f3f";
                });
            });
    });

    return parentDoc;
}

// handle click on assignment
async function handleAssignmentClick(id) {
    const assignment = assignments.find((a) => a.id === id);
    const motivationMsg = document.getElementById("pet-motivation-msg");

    if (!assignment.whyImportant) {
        assignment.whyImportant = await determineWhyImportant(assignment);
        await Storage.setAssignments(assignments);
    }

    // diplay the importance of the assignment as the pet's message
    displayMotivation(assignment.whyImportant, motivationMsg);
}

function isWithinNext7Days(dueDateStr) {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const due = new Date(dueDateStr);

    return due >= now && due <= weekFromNow;
}

function createPetStats() {
    const parentDoc = document.createElement("div");

    const header = document.createElement("h3");
    const moodStatBar = createStatBar("Mood", 85);
    const wellbeingStatBar = createStatBar("Well-being", 40);

    parentDoc.style.backgroundColor = "#ffa362";
    parentDoc.style.borderRadius = "5px";
    parentDoc.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
    parentDoc.style.padding = "5px";
    parentDoc.style.margin = "10px";

    header.textContent = "Pet Stats";
    header.style.textAlign = "center";
    header.style.padding = "0px";
    header.style.color = "white";

    parentDoc.appendChild(header);
    parentDoc.appendChild(moodStatBar);
    parentDoc.appendChild(wellbeingStatBar);

    return parentDoc;
}

function createStatBar(label, percent) {
    const statBar = document.createElement("div");
    const statLabel = document.createElement("p");
    const bar = document.createElement("div");
    const barBg = document.createElement("div");
    const barFill = document.createElement("div");
    const percentNum = document.createElement("p");

    statBar.style.padding = "0 5px 0 5px";

    statLabel.textContent = label;
    percentNum.textContent = percent + "%";

    statLabel.style.textAlign = "center";
    statLabel.style.fontWeight = "bold";
    statLabel.style.padding = "0px";
    statLabel.style.margin = "0px";
    statLabel.style.color = "white";

    percentNum.style.color = "white";

    bar.style.display = "flex";
    bar.style.width = "auto";
    bar.style.flexDirection = "row";
    bar.style.alignItems = "center";
    bar.style.padding = "0px";
    bar.style.gap = "5px";
    bar.style.margin = "0px";

    barBg.style.backgroundColor = "#dddddd";
    barBg.style.height = "20px";
    barBg.style.width = "100%";
    barBg.style.display = "flex";
    barBg.style.alignItems = "center";
    barBg.style.borderRadius = "10px";

    barFill.style.backgroundColor = "#4ec67f";
    barFill.style.height = "100%";
    barFill.style.width = percent + "%";
    barFill.style.borderRadius = "10px";

    statBar.appendChild(statLabel);
    statBar.appendChild(bar);
    bar.appendChild(barBg);
    barBg.appendChild(barFill);
    bar.appendChild(percentNum);
    return statBar;
}

function updatePet(moodToggle, imageElement) {
    const animal = isDog ? "dog" : "cat";
    const mood = moodToggle.checked ? "happy" : "normal";

    const paths = getAnimalPaths();
    console.log(paths[animal][mood]);
    imageElement.src = paths[animal][mood];
}

//LLM stuff
async function GetMotivation() {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: "You are an encouraging virtual pet. Give a short 1-2 sentence motivational message to a student who is behind on their assignments. Be friendly and upbeat!",
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        const data = await response.json();
        console.log("Gemini response:", data);
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("LLM Error:", error);
        return "You got this!";
    }
}

// Helper to display why an assignment is important based on its details (e.g. due date, course, etc.)
async function determineWhyImportant(assignment) {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Given the following assignment details, explain in 1-2 sentences why this assignment might be important for a student to complete:\n\nTitle: ${assignment.title}\nCourse: ${assignment.course}\nDue Date: ${assignment.dueAt}`,
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        const data = await response.json();

        console.log("Gemini importance response:", data);
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("LLM Error:", error);
        return "This assignment is important for your learning and success in the course!";
    }
}

function displayMotivation(message, msgElement) {
    if (msgElement) {
        msgElement.textContent = message;
    }
}

async function PromptLLM(msgElement) {
    const motivationalMessage = await GetMotivation();
    displayMotivation(motivationalMessage, msgElement);
}

renderCanvasPets(document.querySelector("aside"));
