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

    // Get planner items and log assignments to console once they are fetched
    getPlannerItems().then(() => {
        console.log("Assignments: ", assignments);
    });

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


function getAnimalPaths(){
	const catNormalPath = chrome.runtime.getURL("/Images/Cat/CatWagTail.gif");
	const catHappyPath = chrome.runtime.getURL("/Images/Cat/CatHappy.gif");
	const dogNormalPath = chrome.runtime.getURL("/Images/Dog/DogTailWag.gif");
	const dogHappyPath = chrome.runtime.getURL("/Images/Dog/Happy Dog.gif");

	return {
		cat: {
			normal: catNormalPath,
			happy:  catHappyPath,
		},
		dog: {
			normal: dogNormalPath,
			happy:  dogHappyPath,
		}
	};

}

function renderCanvasPets(element){
	if(!element){
		return;
	}

	const canvasPets = document.createElement("div");
	const title = document.createElement("h2");
	const petImg = document.createElement("img");

	const toggleLabel = document.createElement("p");
	const petToggleLabel = document.createElement("label");
	const petToggleCheck = document.createElement("input");
	const checkSpace = document.createElement("br");
	const moodToggleLabel = document.createElement("label");
	const moodToggleCheck = document.createElement("input");

	title.textContent = "Welcome to Canvas Pets!";
	
	const animalPaths = getAnimalPaths();
	petImg.src = animalPaths["cat"]["normal"];
	petImg.alt = 'Image of cat wagging tail';
	petImg.id = 'petImg';

	toggleLabel.textContent = "Modify Pet!";

	petToggleLabel.for = "petToggle";
	petToggleLabel.textContent = "Dog / Cat";
	petToggleCheck.type = "checkbox";
	petToggleCheck.id = "petToggle";

	moodToggleLabel.for = "moodToggle";
	moodToggleLabel.textContent = "Happy";
	moodToggleCheck.type = "checkbox";
	moodToggleCheck.id = "moodToggle";

	petToggleCheck.addEventListener("change", () => {
		updatePet(petToggleCheck, moodToggleCheck, petImg)
	});
	moodToggleCheck.addEventListener("change", () => {
		updatePet(petToggleCheck, moodToggleCheck, petImg)
	});
	


	canvasPets.appendChild(title);
	canvasPets.appendChild(petImg);
	canvasPets.appendChild(toggleLabel);
	canvasPets.appendChild(petToggleCheck);
	canvasPets.appendChild(petToggleLabel);
	canvasPets.appendChild(checkSpace);
	canvasPets.appendChild(moodToggleCheck);
	canvasPets.appendChild(moodToggleLabel);

	element.insertAdjacentElement("beforebegin", canvasPets);
}

function updatePet(animalToggle, moodToggle, imageElement) {
	const isDog = animalToggle.checked;
	const isHappy = moodToggle.checked;

	const animal = isDog ? "dog" : "cat";
	const mood = isHappy ? "happy" : "normal";

	const paths = getAnimalPaths();
	console.log(paths[animal][mood]);
	imageElement.src = paths[animal][mood];
}

renderCanvasPets(document.querySelector("aside"));


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
