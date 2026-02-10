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


function renderSomething(element){
	if(!element){
		console.log("Alas");
		return;
	}
	console.log("We're here");

	const text = element.textContent;
	const wordMatchRegExp = /[^\s]+/g; // Regular expression
	const words = text.matchAll(wordMatchRegExp);
	// matchAll returns an iterator, convert to array to get word count
	const wordCount = [...words].length;
	const readingTime = Math.round(wordCount / 200);
	const badge = document.createElement("p");
	console.log("Because we're here");
	badge.textContent = `YO HO HO HO HO`;
	/*
	// Use the same styling as the publish information in an article's header
	badge.classList.add("color-secondary-text", "type--caption");
	badge.textContent = `⏱️ ${readingTime} min read`;

	// Support for API reference docs
	const heading = article.querySelector("h1");
	// Support for article docs with date
	const date = article.querySelector("time")?.parentNode;

	(date ?? heading).insertAdjacentElement("afterend", badge);
	*/
	element.insertAdjacentElement("afterend", badge);
}

renderSomething(document.querySelector("aside"));


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
