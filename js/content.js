// Everything in this file is loaded into the browser context
//kskskkskks
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

  // Get assignments from storage or fetch from API if not available or outdated
  let assignments = getAssignmentsFromStorageOrFetch(getPlannerItems).then(
    (assignments) => {
      console.log("Assignments ready for use: ", assignments);
    }
  );
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
  const toDoList = createToDoList();

  title.textContent = "Welcome to Canvas Pets!";
  title.style.textAlign = "center";

  canvasPets.appendChild(title);
  canvasPets.appendChild(petImages);
  canvasPets.appendChild(petStats);
  canvasPets.appendChild(toDoList);

}

async function getPlannerItems() {
    // API endpoint to get planner items for a specific date range
    // filtering for incomplete items
    // limiting to 100 results per page
    const url = domain + "/api/v1/planner/items" +
        "?start_date=2026-02-04" + "&end_date=2026-02-16" +
        "&filter=incomplete_items" + "&per_page=100";

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

  getAssignmentsFromStorageOrFetch(getPlannerItems).then((assignments) => {
    const { toDoAssignments } = organizeAssignments(assignments);

    toDoAssignments
      .filter((a) => isWithinNext7Days(a.plannable_date))
      .forEach((a) => {
        const card = document.createElement("div");
        const title = document.createElement("div");
        const due = document.createElement("div");

        title.textContent = a.plannable?.title || "Untitled";

        const dueDate = new Date(a.plannable_date);
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

        due.style.fontSize = "12px";
        due.style.opacity = "0.9";

        card.appendChild(title);
        card.appendChild(due);
        parentDoc.appendChild(card);
      });
  });

  return parentDoc;
}

function isWithinNext7Days(dueDateStr) {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const due = new Date(dueDateStr);

  return due >= now && due <= weekFromNow;
}

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