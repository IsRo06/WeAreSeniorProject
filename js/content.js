// Everything in this file is loaded into the browser context
// CONSTANTS
const domain = window.location.origin;
let assignments = [];
let toDoAssignments = [];
let overdueAssignments = [];
let completedAssignments = [];
let motivationAnswers = {};

const colorBg = "#094b80";
const colorBgDark = "#07375F";
const colorScene = "#6B9AC4";
const colorBtn = colorBgDark;
const colorBarBg = "#ddd";
const colorBarGreen = "#659B5E";

let pet = {
  mood: "happy",
  wellbeing: "good",
};

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

let animalType = "cat1";

console.log("Canvas Pet content.js loaded");

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.selectedPet) {
    const newValue = changes.selectedPet.newValue;
    animalType = newValue;
    console.log("Animal Type: " + animalType);

    const petImg = document.getElementById("petImg");
    const moodToggle = document.getElementById("moodToggle");

    if (petImg && moodToggle) {
      updatePet(moodToggle, petImg);
    }
  }

  // listen for changes to motivation answers to update the context for the LLM and the pet's motivational messages
  if (area === "local" && changes.motivationAnswers) {
    motivationAnswers = changes.motivationAnswers.newValue;
    console.log("Motivation answers updated:", motivationAnswers);
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
  let toDo = [];
  let overdue = [];
  let completed = [];

  if (!Array.isArray(assignments)) assignments = [];

  for (let assignment of assignments) {
    if (assignment.completed) {
      completed.push(assignment);
      continue;
    }
    let dueDate = new Date(assignment.dueAt);
    if (dueDate < now) {
      console.log(assignment);
      overdue.push(assignment);
    } else {
      toDo.push(assignment);
    }
  }

  toDoAssignments = toDo;
  overdueAssignments = overdue;
  completedAssignments = completed;

  console.log("Organized assignments: ", {
    toDoAssignments,
    overdueAssignments,
    completedAssignments,
  });
}

// start the extension
function startExtension() {
  console.log("This is Canvas! Incoming Pets!");
  console.log("Page title: ", document.title);

  hideTodo();

  chrome.storage.local.get(["selectedPet"], (result) => {
    if (result.selectedPet) {
      animalType = result.selectedPet;
      console.log("Loaded selected pet:", animalType);
    }
  });

  chrome.storage.local.get(["pet"], (result) => {
    if (result.pet) {
      pet = result.pet;
    }
  });

  chrome.storage.local.get(["motivationAnswers"], (result) => {
    console.log("Motivation answers on load:", result.motivationAnswers);
    motivationAnswers = result.motivationAnswers || null;
  });
  // Get assignments from storage or fetch from API if not available or outdated
  getAssignmentsFromStorageOrFetch(getPlannerItems).then((result) => {
    assignments = result;
    organizeAssignments(assignments);
    console.log("Assignments ready for use: ", assignments);
    renderCanvasPets(document.querySelector("aside")); // move here
  });
}

async function getPlannerItems() {
  // API endpoint to get planner items for a specific date range
  // filtering for incomplete items
  // limiting to 100 results per page
  const today = new Date().toISOString().split("T")[0];
  const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const url =
    domain +
    "/api/v1/planner/items" +
    `?start_date=${today}` +
    `&end_date=${future}` +
    "&per_page=100";

  try {
    let response = await fetch(url);

    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.statusText);
    }

    const data = await response.json();

    // Filter for assignments only
    const rawAssignments = data.filter(
      (item) =>
        item.plannable_type === "assignment" || item.plannable_type === "quiz"
    );

    // Normalize the assignment data
    assignments = await Promise.all(rawAssignments.map(normalizeAssignment));

    console.log("Fetched and normalized assignments: ", assignments);

    return assignments;
  } catch (error) {
    console.error("Error fetching planner items:", error);
  }
}

// Normalize assignments
async function normalizeAssignment(item) {
  console.log(item);
  return {
    id: item.plannable_id,
    title: item.plannable?.title || "Untitled",
    dueAt: item.plannable?.due_at || null,
    course: item.context_name || "No Course",
    whyImportant: null, // only generate if the user clicks on the assignment, to save API calls
    completed: item.submissions.submitted,
  };
}

// get assignments from storage or fetch from API if not available or outdated
async function getAssignmentsFromStorageOrFetch(
  getPlannerItems,
  //fetchAgainTimer = 0
  fetchAgainTimer = 60 * 60 * 1000 // 1 hour
) {
  const { assignments: storedAssignments, updatedAt } =
    await Storage.getAssignments();

  // check if we need to fetch new assignments based on the last updated time and the defined timer
  if (
    storedAssignments &&
    updatedAt &&
    storedAssignments.length > 0 &&
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
  return {
    cat1: {
      normal: chrome.runtime.getURL("/Images/Cat/Cat1Wag.gif"),
      happy: chrome.runtime.getURL("/Images/Cat/Cat1Happy.gif"),
      hungry: chrome.runtime.getURL("/Images/Cat/Cat1Hungry.gif"),
      eating: chrome.runtime.getURL("/Images/Cat/Cat1Eating.gif"),
    },
    cat2: {
      normal: chrome.runtime.getURL("/Images/Cat/Cat2Wag.gif"),
      happy: chrome.runtime.getURL("/Images/Cat/Cat2Happy.gif"),
      hungry: chrome.runtime.getURL("/Images/Cat/Cat2Hungry.gif"),
      eating: chrome.runtime.getURL("/Images/Cat/Cat2Eating.gif"),
    },
    cat3: {
      normal: chrome.runtime.getURL("/Images/Cat/Cat3Wag.gif"),
      happy: chrome.runtime.getURL("/Images/Cat/Cat3Happy.gif"),
      hungry: chrome.runtime.getURL("/Images/Cat/Cat3Hungry.gif"),
      eating: chrome.runtime.getURL("/Images/Cat/Cat3Eating.gif"),
    },
    dog1: {
      normal: chrome.runtime.getURL("/Images/Dog/Dog1Wag.gif"),
      happy: chrome.runtime.getURL("/Images/Dog/Dog1Happy.gif"),
      hungry: chrome.runtime.getURL("/Images/Dog/Dog1Hungry.gif"),
      eating: chrome.runtime.getURL("/Images/Dog/Dog1Eating.gif"),
    },
    dog2: {
      normal: chrome.runtime.getURL("/Images/Dog/Dog2Wag.gif"),
      happy: chrome.runtime.getURL("/Images/Dog/Dog2Happy.gif"),
      hungry: chrome.runtime.getURL("/Images/Dog/Dog2Hungry.gif"),
      eating: chrome.runtime.getURL("/Images/Dog/Dog2Eating.gif"),
    },
    dog3: {
      normal: chrome.runtime.getURL("/Images/Dog/Dog3Wag.gif"),
      happy: chrome.runtime.getURL("/Images/Dog/Dog3Happy.gif"),
      hungry: chrome.runtime.getURL("/Images/Dog/Dog3Hungry.gif"),
      eating: chrome.runtime.getURL("/Images/Dog/Dog3Eating.gif"),
    },
    axolotl: {
      normal: chrome.runtime.getURL("/Images/Axolotl/AxolotlWag.gif"),
      happy: chrome.runtime.getURL("/Images/Axolotl/AxolotlHappy.gif"),
      hungry: chrome.runtime.getURL("/Images/Axolotl/AxolotlHungry.gif"),
      eating: chrome.runtime.getURL("/Images/Axolotl/AxolotlEating.gif"),
    },
  };
}

function playCompleteSequence(duration = 2000) {
  const petImg = document.getElementById("petImg");
  if (!petImg) return;

  const animal = animalType || "cat1";
  const paths = getAnimalPaths()[animal];
  if (!paths) return;

  petImg.src = paths.eating;

  setTimeout(() => {
    petImg.src = paths.happy;

    setTimeout(() => {
      petImg.src = overdueAssignments.length > 0 ? paths.hungry : paths.normal;
    }, duration);
  }, duration);
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

  canvasPets.id = "canvas-pets-root";

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

  const petHouse = document.createElement("img");
  petHouse.id = "petHouse";
  petHouse.src = chrome.runtime.getURL("/Images/PetHouse.png");
  petHouse.alt = "Pet House";

  const petRefreshBtn = document.createElement("button");
  const petMotivateBtn = document.createElement("button");
  const spacer = document.createElement("br");
  const settingsBtn = document.createElement("button");
  const settingsPanel = createSettingsPanel();

  const moodToggleLabel = document.createElement("label");
  const moodToggleCheck = document.createElement("input");

  if (motivationAnswers) {
    motivationMsg.textContent = "You can do it!";
  } else {
    motivationMsg.textContent =
      "Please set up Canvas Pets with your motivations in the pop up!";
  }

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
  motivationMsg.style.borderRadius = "8px";
  motivationMsg.style.padding = "8px";
  motivationMsg.style.margin = "8px auto";
  motivationMsg.style.maxWidth = "260px";
  motivationMsg.style.maxHeight = "120px";
  motivationMsg.style.overflowY = "auto";
  motivationMsg.style.lineHeight = "1.4";
  motivationMsg.style.fontSize = "13px";
  motivationMsg.style.boxSizing = "border-box";

  petImg.alt = "Image of pet";
  petImg.id = "petImg";

  petRefreshBtn.style.backgroundColor = colorBtn;
  petRefreshBtn.style.border = "none";
  petRefreshBtn.style.borderRadius = "5px";
  petRefreshBtn.style.color = "white";
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
  petMotivateBtn.style.color = "white";
  petMotivateBtn.style.padding = "10px";
  petMotivateBtn.style.textAlign = "center";
  petMotivateBtn.style.cursor = "pointer";
  petMotivateBtn.style.marginLeft = "auto";
  petMotivateBtn.style.marginRight = "auto";
  petMotivateBtn.style.marginTop = "4px";
  petMotivateBtn.textContent = "Get Motivation!";

  settingsBtn.textContent = "\u2699";

  settingsBtn.style.background = "transparent";
  settingsBtn.style.border = "none";
  settingsBtn.style.cursor = "pointer";
  settingsBtn.style.fontSize = "18px";
  settingsBtn.style.padding = "4px";
  settingsBtn.style.color = "white";
  settingsBtn.style.marginLeft = "90%";

  moodToggleLabel.for = "moodToggle";
  moodToggleLabel.textContent = "Happy";
  moodToggleLabel.style.color = "white";
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
    if (!motivationAnswers) {
      motivationMsg.textContent = "Please complete the motivation setup!";
    } else {
      motivationMsg.textContent = "Thinking...";
      PromptLLM(motivationMsg);
    }
  });

  settingsBtn.addEventListener("click", () => {
    if (settingsPanel.style.display === "none") {
      settingsPanel.style.display = "block";
    } else {
      settingsPanel.style.display = "none";
    }
  });

  const petRow = document.createElement("div");
  petRow.id = "petRow";

  petRow.style.display = "flex";
  petRow.style.alignItems = "flex-end";
  petRow.style.justifyContent = "space-between";
  petRow.style.width = "100%";
  petRow.style.marginTop = "0px";

  petImg.style.display = "block";
  petImg.style.width = "72px";
  petImg.style.height = "72px";
  petImg.style.objectFit = "contain";

  petHouse.style.display = "block";
  petHouse.style.width = "110px";
  petHouse.style.height = "110px";
  petHouse.style.objectFit = "contain";
  petHouse.style.imageRendering = "pixelated";
  petHouse.style.marginLeft = "auto";

  petRow.appendChild(petImg);
  petRow.appendChild(petHouse);

  parentDoc.appendChild(settingsBtn);
  parentDoc.appendChild(petScene);
  petScene.appendChild(motivationMsg);
  petScene.appendChild(petRow);

  parentDoc.appendChild(petRefreshBtn);
  parentDoc.appendChild(petMotivateBtn);
  parentDoc.appendChild(settingsPanel);
  parentDoc.appendChild(spacer);

  // parentDoc.appendChild(moodToggleCheck);
  // parentDoc.appendChild(moodToggleLabel);

  return parentDoc;
}

function createSettingsPanel() {
  const parentDoc = document.createElement("div");

  const petContainer = createPetCarousel();
  // const motivationQuestionContainer = createMotivationQuestionnaire();

  const motivationBtn = document.createElement("button");

  parentDoc.style.display = "none";
  parentDoc.style.backgroundColor = "white";
  parentDoc.style.borderRadius = "5px";
  parentDoc.style.padding = "10px";
  parentDoc.style.marginTop = "8px";
  parentDoc.style.color = "black";
  parentDoc.textContent = "Settings";
  parentDoc.style.textAlign = "center";

  motivationBtn.style.backgroundColor = colorBtn;
  motivationBtn.style.border = "none";
  motivationBtn.style.borderRadius = "5px";
  motivationBtn.style.color = "white";
  motivationBtn.style.padding = "10px";
  motivationBtn.style.textAlign = "center";
  motivationBtn.style.cursor = "pointer";
  motivationBtn.style.width = "100%";
  motivationBtn.style.marginTop = "4px";
  motivationBtn.textContent = "Motivation Setup";

  motivationBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "openMotivation" });
  });

  parentDoc.appendChild(petContainer);
  parentDoc.appendChild(motivationBtn);
  // parentDoc.appendChild(motivationQuestionContainer);
  return parentDoc;
}

function createPetCarousel() {
  const parentDoc = document.createElement("div");
  parentDoc.style.width = "100%";

  const carouselWrapper = document.createElement("div");
  carouselWrapper.style.display = "flex";
  carouselWrapper.style.alignItems = "center";
  carouselWrapper.style.justifyContent = "center";
  carouselWrapper.style.gap = "6px";
  carouselWrapper.style.backgroundColor = colorScene;
  carouselWrapper.style.borderRadius = "5px";

  const prevBtn = document.createElement("button");
  const nextBtn = document.createElement("button");
  const selectPetBtn = document.createElement("button");

  prevBtn.textContent = "‹";
  nextBtn.textContent = "›";

  [prevBtn, nextBtn].forEach((btn) => {
    btn.style.background = "transparent";
    btn.style.border = "none";
    btn.style.color = "white";
    btn.style.fontSize = "18px";
    btn.style.cursor = "pointer";
  });

  selectPetBtn.style.backgroundColor = colorBtn;
  selectPetBtn.style.border = "none";
  selectPetBtn.style.borderRadius = "5px";
  selectPetBtn.style.color = "white";
  selectPetBtn.style.padding = "10px";
  selectPetBtn.style.textAlign = "center";
  selectPetBtn.style.cursor = "pointer";
  selectPetBtn.style.width = "100%";
  selectPetBtn.style.marginTop = "4px";
  selectPetBtn.textContent = "Select Pet";

  const pets = ["cat1", "cat2", "cat3", "dog1", "dog2", "dog3", "axolotl"];
  let currentIndex = 0;

  const img = document.createElement("img");
  img.style.width = "60px";
  img.style.height = "60px";
  img.style.objectFit = "contain";

  function updateCarouselImage() {
    paths = getAnimalPaths();
    const pet = pets[currentIndex];
    img.src = paths[pet].normal;
  }

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % pets.length;
    updateCarouselImage();
  });

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + pets.length) % pets.length;
    updateCarouselImage();
  });

  selectPetBtn.addEventListener("click", async () => {
    const selectedPet = pets[currentIndex];

    await chrome.storage.local.set({ selectedPet });

    console.log("Selected pet:", selectedPet);
  });

  chrome.storage.local.get(["selectedPet"], (result) => {
    if (result.selectedPet) {
      const index = pets.indexOf(result.selectedPet);
      if (index !== -1) {
        currentIndex = index;
      }
    }

    updateCarouselImage();
  });

  carouselWrapper.appendChild(prevBtn);
  carouselWrapper.appendChild(img);
  carouselWrapper.appendChild(nextBtn);

  parentDoc.appendChild(carouselWrapper);
  parentDoc.appendChild(selectPetBtn);
  return parentDoc;
}

function createToDoList() {
  motivationCheck();

  const parentDoc = document.createElement("div");

  const header = document.createElement("h3");

  parentDoc.style.backgroundColor = colorBg;
  parentDoc.style.borderRadius = "5px";
  parentDoc.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
  parentDoc.style.paddingTop = "12px";
  parentDoc.style.paddingLeft = "12px";
  parentDoc.style.paddingRight = "12px";
  parentDoc.style.paddingBottom = "200px";
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

  toDoAssignments
    .filter((a) => isWithinNext7Days(a.dueAt))
    .forEach((a) => {
      const card = document.createElement("div");
      const title = document.createElement("div");
      const due = document.createElement("div");

      const courseText = document.createElement("span");
      const assignmentText = document.createElement("span");

      courseText.textContent = a.course.split("-")[0].trim() + ": ";
      assignmentText.textContent = a.title || "Untitled";

      assignmentText.style.fontSize = "12px";
      assignmentText.style.opacity = "0.9";

      title.appendChild(courseText);
      title.appendChild(assignmentText);

      const dueDate = new Date(a.dueAt);
      const dueDateDisplay = "Due: " + dueDate.toLocaleDateString();
      due.textContent = dueDateDisplay.slice(0, -5);

      card.style.position = "relative";
      card.style.backgroundColor = colorBgDark;
      card.style.borderRadius = "5px";
      card.style.padding = "8px 10px";
      card.style.marginTop = "8px";
      card.style.width = "100%";
      card.style.color = "white";
      card.style.boxSizing = "border-box";

      card.style.display = "flex";
      card.style.justifyContent = "space-between";
      card.style.alignItems = "flex-start";

      title.style.flex = "1";
      title.style.marginRight = "10px";

      due.style.whiteSpace = "nowrap";
      due.style.alignSelf = "flex-start";
      card.style.cursor = "pointer";

      due.style.fontSize = "12px";
      due.style.opacity = "0.9";

      const completeBtn = document.createElement("button");

      completeBtn.textContent = "Mark Complete";

      completeBtn.style.position = "absolute";
      completeBtn.style.bottom = "6px";
      completeBtn.style.right = "6px";

      completeBtn.style.padding = "4px 8px";
      completeBtn.style.fontSize = "10px";

      completeBtn.style.border = "none";
      completeBtn.style.borderRadius = "4px";

      completeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
      completeBtn.style.color = "white";

      completeBtn.style.cursor = "pointer";

      completeBtn.addEventListener("mouseenter", () => {
        completeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.35)";
      });

      completeBtn.addEventListener("mouseleave", () => {
        completeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
      });

      completeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();

        console.log("CLICKED:", a.title, a.completed);

        if (a.completed) return;

        a.completed = true;

        organizeAssignments(assignments);
        await Storage.setAssignments(assignments);

        card.remove();

        playCompleteSequence(2000);
      });

      card.appendChild(completeBtn);
      card.appendChild(title);
      card.appendChild(due);
      parentDoc.appendChild(card);

      card.addEventListener("click", async () => {
        await handleAssignmentClick(a.id);
      });
    });

  return parentDoc;
}

async function handleAssignmentClick(id) {
  const assignment = assignments.find((a) => a.id === id);
  const motivationMsg = document.getElementById("pet-motivation-msg");
  motivationMsg.textContent = "Thinking...";

  if (!motivationAnswers) {
    motivationMsg.textContent =
      "Please complete motivation setup in the pop up!";
    return;
  }

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

function motivationCheck() {
  let curr = new Date();
  let week = [];
  let toDoAssignmentsCurrentWeek = [];
  let completedAssignmentsCurrentWeek = [];

  //console.log("CHECK MOOD:", { toDoAssignments, completedAssignments });

  for (let i = 1; i <= 7; i++) {
    let first = curr.getDate() - curr.getDay() + i;
    let day = new Date(curr);
    day.setDate(first);
    day.setHours(0, 0, 0, 0);
    week.push(day);
  }

  week[6].setHours(23, 59, 59, 999);

  //console.log("WEEK:", week);

  for (let a of toDoAssignments) {
    let due = new Date(a.dueAt);

    if (due >= week[0] && due <= week[6]) {
      toDoAssignmentsCurrentWeek.push(a);
    }
  }

  for (let a of completedAssignments) {
    let due = new Date(a.dueAt);

    if (due >= week[0] && due <= week[6]) {
      completedAssignmentsCurrentWeek.push(a);
    }
  }

  //console.log("CURRENT MOOD", toDoAssignmentsCurrentWeek, completedAssignmentsCurrentWeek);

  let total =
    completedAssignmentsCurrentWeek.length + toDoAssignmentsCurrentWeek.length;

  if (total === 0) return 0;

  return (completedAssignmentsCurrentWeek.length / total) * 100;
}

function createPetStats() {
  let moodPercent = motivationCheck();

  const parentDoc = document.createElement("div");

  const header = document.createElement("h3");
  const moodStatBar = createStatBar("Mood", moodPercent);
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

// Sets the pet's idle animation. Defaults to hungry if there are overdue assignments,
// otherwise uses the normal wag. The happy mood toggle overrides both.
function updatePet(moodToggle, imageElement) {
  const animal = animalType || "cat1";
  const paths = getAnimalPaths();

  if (!paths[animal]) {
    console.log("Missing pet paths for:", animal);
    return;
  }

  let mood;
  if (moodToggle.checked) {
    mood = "happy";
  } else if (overdueAssignments.length > 0) {
    mood = "hungry";
  } else {
    mood = "normal";
  }

  if (!paths[animal][mood]) {
    console.log("Missing pet path for:", animal, mood);
    return;
  }

  console.log("Updating pet to:", animal, mood, paths[animal][mood]);
  imageElement.src = paths[animal][mood];
}

function getMotivationContext() {
  console.log(
    "getMotivationContext called, motivationAnswers:",
    motivationAnswers
  );
  if (!motivationAnswers) return "";

  // summary of questionnaire answers to provide context to the LLM for generating motivation messages
  const summary = motivationAnswers
    .filter((a) => a.answer !== null)
    .map((a) => `${a.question}: ${a.answer}/5`)
    .join("\n");

  console.log("Motivation questionnaire summary for LLM context: ", summary);

  return `\n\nThe student answered a motivation questionnaire (1=disagree, 5=agree):\n${summary}\nAnalyze and mention" these to encourage the student and make the motivation message more personalized.`;
}

//LLM stuff
async function GetMotivation() {
  try {
    const response = await fetch("https://api.ai.it.ufl.edu/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.LITELLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-instruct",
        messages: [
          {
            role: "user",
            content:
              "You are an encouraging virtual pet. Give a short 1-2 sentence motivational message to a student who is behind on their assignments. Respond in an undergraduate student's tone" +
              getMotivationContext(),
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("LiteLLM response:", data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error("LLM Error:", error);
    return "You got this!";
  }
}

// Helper to display why an assignment is important based on its details (e.g. due date, course, etc.)
async function determineWhyImportant(assignment) {
  try {
    const response = await fetch("https://api.ai.it.ufl.edu/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONFIG.LITELLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-instruct",
        messages: [
          {
            role: "user",
            content:
              `Given the following assignment details, explain in 1-2 sentences why this assignment might be important for a student to complete:\n\nTitle: ${assignment.title}\nCourse: ${assignment.course}\nDue Date: ${assignment.dueAt}\nRespond in an undergraduate student's tone` +
              getMotivationContext(),
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("LiteLLM importance response:", data);
    return data.choices[0].message.content;
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
