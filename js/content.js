// Everything in this file is loaded into the browser context

// CONSTANTS
const domain = window.location.origin;
let assignments = null;


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

}

async function getPlannerItems() {
    // API endpoint to get planner items for a specific date range
    // filtering for incomplete items
    // limiting to 100 results per page
    const url = domain + "/api/v1/planner/items" +
        "?start_date=2026-02-04" + "&end_date=2026-02-16" +
        "&filter=incomplete_items" + "&per_page=100";

function createPetStats() {
  const parentDoc = document.createElement("div");

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

/****** EXAMPLE TO PARSE TODO LIST ******/
/*

// Parses to do list on the right sidebar
function parseTodoItem(li) {
    const info = li.querySelector('[data-testid="todo-sidebar-item-info"]');
    if (!info) return null;

    const a = info.querySelector('[data-testid="todo-sidebar-item-title"] a');
    const title = a?.textContent?.trim() ?? null;

    const href = a?.getAttribute("href") ?? null;
    const url = href ? new URL(href, location.origin).href : null;

    const course = info.querySelector("span.css-79wf76-text")?.textContent?.trim() ?? null;

    const dueDteText = info
        .querySelector('[data-testid="ToDoSidebarItem__InformationRow"] li')
        ?.textContent?.trim() ?? null;

    return { title, course, dueDteText, url };
}


function parseTodoList() {
    const list = document.querySelector("#planner-todosidebar-item-list");
    if (!list) {
      console.warn("To-Do list not found yet.");
      return [];
    }

    const items = Array.from(list.querySelectorAll(":scope > li"))
     .map(parseTodoItem)
     .filter(Boolean);

    return items;
}

// Function to wait for something specific to show on screen

function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
     const start = Date.now();
     const interval = setInterval(() => {
         const el = document.querySelector(selector);
         if (el) {
           clearInterval(interval);
           resolve(el);
         } else if (Date.now() - start > timeout) {
          clearInterval(interval);
          reject(new Error("Timed out waiting for " + selector));
         }
     }, 200);
     });
}

*/