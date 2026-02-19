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

let isDog = false;

console.log("Canvas Pet content.js loaded");

chrome.storage.onChanged.addListener((changes, area) => {
	if(area === 'local' &&  changes.dogSelected) {
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

	const petImages = createPetImages();
	const petStats = createPetStats();

	title.textContent = "Welcome to Canvas Pets!";
	title.style.textAlign = "center";
	

	canvasPets.appendChild(title);
	canvasPets.appendChild(petImages);
	canvasPets.appendChild(petStats);

	element.insertAdjacentElement("beforebegin", canvasPets);
}

function createPetImages(){
	const parentDoc = document.createElement("div");

	const petScene = document.createElement("div");

	const motivationMsg = document.createElement("p");
	const petImg = document.createElement("img");

	const petRefreshBtn = document.createElement("button");
	const spacer = document.createElement("br");

	const moodToggleLabel = document.createElement("label");
	const moodToggleCheck = document.createElement("input");

	motivationMsg.textContent = "I am motivating!";

	parentDoc.style.backgroundColor = "#ffa362";
	parentDoc.style.borderRadius = "5px";
	parentDoc.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
	parentDoc.style.padding = "5px";
	parentDoc.style.margin = "10px";

	petScene.style.backgroundColor = "#FFF585";
	petScene.style.padding = "10px";
	petScene.style.borderRadius = "5px";

	motivationMsg.style.backgroundColor = "white";
	motivationMsg.style.textAlign = "left";
	motivationMsg.style.marginLeft = "auto";
	motivationMsg.style.marginRight = "auto";
	motivationMsg.style.borderRadius = "3px";
	motivationMsg.style.width = "50%";
	motivationMsg.style.padding = "5px";

	const animalPaths = getAnimalPaths();
	petImg.alt = 'Image of cat wagging tail';
	petImg.id = 'petImg';


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


	moodToggleLabel.for = "moodToggle";
	moodToggleLabel.textContent = "Happy";
	moodToggleCheck.type = "checkbox";
	moodToggleCheck.id = "moodToggle";
	updatePet(moodToggleCheck, petImg); 

	moodToggleCheck.addEventListener("change", () => {
		updatePet(moodToggleCheck, petImg)
	});

	petRefreshBtn.addEventListener("click", () => {
		updatePet(moodToggleCheck, petImg)
	});


	parentDoc.appendChild(petScene);
	petScene.appendChild(motivationMsg);
	petScene.appendChild(petImg);
	parentDoc.appendChild(petRefreshBtn);
	parentDoc.appendChild(spacer);
	parentDoc.appendChild(moodToggleCheck);
	parentDoc.appendChild(moodToggleLabel);

	return parentDoc;
}

function createPetStats(){
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
	header.style.textAlign = 'center';
	header.style.padding = '0px';
	header.style.color = "white";

	parentDoc.appendChild(header);
	parentDoc.appendChild(moodStatBar);
	parentDoc.appendChild(wellbeingStatBar);

	return parentDoc;
}

function createStatBar(label, percent){
	const statBar = document.createElement("div");
	const statLabel = document.createElement("p");
	const bar = document.createElement("div");
	const barBg = document.createElement("div");
	const barFill = document.createElement("div");
	const percentNum = document.createElement("p");

	statBar.style.padding = "0 5px 0 5px";

	statLabel.textContent = label;
	percentNum.textContent = percent + "%";

	statLabel.style.textAlign = 'center';
	statLabel.style.fontWeight = 'bold';
	statLabel.style.padding = '0px';
	statLabel.style.margin = '0px';
	statLabel.style.color = "white";

	percentNum.style.color = "white";


	bar.style.display = 'flex';
	bar.style.width = "auto";
	bar.style.flexDirection = 'row';
	bar.style.alignItems = "center";
	bar.style.padding = '0px';
	bar.style.gap = "5px";
	bar.style.margin = '0px';

	barBg.style.backgroundColor = '#dddddd';
	barBg.style.height = '20px';
	barBg.style.width = '100%';
	barBg.style.display = 'flex';
	barBg.style.alignItems = 'center';
	barBg.style.borderRadius = '10px'

	barFill.style.backgroundColor = '#4ec67f';
	barFill.style.height = '100%';
	barFill.style.width = percent + "%";
	barFill.style.borderRadius = '10px'



	statBar.appendChild(statLabel);
	statBar.appendChild(bar);
	bar.appendChild(barBg);
	barBg.appendChild(barFill);
	bar.appendChild(percentNum);
	return statBar;
}


function updatePet(moodToggle, imageElement) {
	// const isDog = animalToggle.checked;
	// const isHappy = moodToggle.checked;

	const animal = isDog ? "dog" : "cat";
	const mood = moodToggle.checked ? "happy" : "normal";

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

    return assignments;
}


*/
