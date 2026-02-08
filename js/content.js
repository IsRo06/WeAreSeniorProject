// Everything in this file is loaded into the browser context

// CONSTANTS
const domain = window.location.origin;
let assignments = null;


console.log("Canvas Pet content.js loaded");
if(isDomainCanvas()){
	startExtension();
}

export function isDomainCanvas() {
	return location.hostname.includes("instructure.com"); 
}

// start the extension
export function startExtension() {
    console.log("This is Canvas! Incoming Pets!");

    console.log("Page title: ", document.title);

    // todo list renders a little after pcanvas loads, so wait a little :)
    waitForElement("#planner-todosidebar-item-list")
    .then(() => console.log(parseTodoList()))
 
}

// Parses to do list on the right sidebar
export function parseTodoItem(li) {
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


export function parseTodoList() {
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

export function waitForElement(selector, timeout = 10000) {
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

