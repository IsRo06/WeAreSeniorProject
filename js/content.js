// Everything in this file is loaded into the browser context

// CONSTANTS
const domain = window.location.origin;
let assignments = null;

const colorBg = "#094b80";
const colorScene = "#6B9AC4";
const colorBtn = "#F4B942";
const colorBarBg = "#ddd";
const colorBarGreen = "#659B5E";

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

let animalType = "cat";

console.log("Canvas Pet content.js loaded");

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.selectedPet) {
    const newValue = changes.selectedPet.newValue;
    animalType = newValue;
    console.log("Animal Type: " + animalType);
  }
});

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
  getAssignmentsFromStorageOrFetch(getPlannerItems).then((assignments) => {
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

    let data = await response.json();

    // Filter for assignments only
    assignments = data.filter((item) => item.plannable_type === "assignment");
  } catch (error) {
    console.error("Error fetching planner items:", error);
  }
}

// get assignments from storage or fetch from API if not available or outdated
async function getAssignmentsFromStorageOrFetch(
  getPlannerItems,
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

  title.textContent = "Welcome to Canvas Pets!";
  title.style.textAlign = "center";

  canvasPets.appendChild(title);
  canvasPets.appendChild(petImages);
  canvasPets.appendChild(petStats);

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

  parentDoc.style.backgroundColor = colorBg;
  parentDoc.style.borderRadius = "5px";
  parentDoc.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
  parentDoc.style.padding = "5px";
  parentDoc.style.margin = "10px";

  petScene.style.backgroundColor = colorScene;
  petScene.style.padding = "10px";
  petScene.style.borderRadius = "5px";

  motivationMsg.style.backgroundColor = "white";
  motivationMsg.style.textAlign = "left";
  motivationMsg.style.marginLeft = "auto";
  motivationMsg.style.marginRight = "auto";
  motivationMsg.style.borderRadius = "10px 10px 10px 1px";
  motivationMsg.style.width = "50%";
  motivationMsg.style.padding = "5px";

  const animalPaths = getAnimalPaths();
  petImg.alt = "Image of cat wagging tail";
  petImg.id = "petImg";

  petRefreshBtn.style.backgroundColor = colorBtn;
  petRefreshBtn.style.border = "none";
  petRefreshBtn.style.borderRadius = "5px";
  petRefreshBtn.style.color = "black";
  petRefreshBtn.style.padding = "10px";
  petRefreshBtn.style.textAlign = "center";
  petRefreshBtn.style.cursor = "pointer";
  petRefreshBtn.style.marginLeft = "auto";
  petRefreshBtn.style.marginRight = "auto";
  petRefreshBtn.style.marginTop = "4px";
  petRefreshBtn.textContent = "Refresh Pet!";

  petMotivateBtn.style.backgroundColor = colorBtn;
  petMotivateBtn.style.border = "none";
  petMotivateBtn.style.borderRadius = "5px";
  petMotivateBtn.style.color = "black";
  petMotivateBtn.style.padding = "10px";
  petMotivateBtn.style.textAlign = "center";
  petMotivateBtn.style.cursor = "pointer";
  petMotivateBtn.style.marginLeft = "auto";
  petMotivateBtn.style.marginRight = "auto";
  petMotivateBtn.style.marginTop = "4px";
  petMotivateBtn.textContent = "Get Motivation!";

  moodToggleLabel.for = "moodToggle";
  moodToggleLabel.textContent = "Happy";
  moodToggleLabel.style.color = "white";
  moodToggleCheck.type = "checkbox";
  moodToggleCheck.id = "moodToggle";
  updatePet(moodToggleCheck, petImg);

  moodToggleCheck.addEventListener("change", () => {
    updatePet(moodToggleCheck, petImg);
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

function createPetStats() {
  const parentDoc = document.createElement("div");

  const header = document.createElement("h3");
  const moodStatBar = createStatBar("Mood", 85);
  const wellbeingStatBar = createStatBar("Well-being", 40);

  parentDoc.style.backgroundColor = colorBg;
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

  barBg.style.backgroundColor = colorBarBg;
  barBg.style.height = "20px";
  barBg.style.width = "100%";
  barBg.style.display = "flex";
  barBg.style.alignItems = "center";
  barBg.style.borderRadius = "10px";

  barFill.style.backgroundColor = colorBarGreen;
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
  const animal = animalType;
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
