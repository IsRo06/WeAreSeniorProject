/*
 * @jest-environment jsdom
 * @jest-environment-options { "url": "https://canvas.instructure.com" }
 */

import { isDomainCanvas } from '/js/content.js';
import { startExtension } from '/js/content.js';
import { parseTodoItem } from '/js/content.js';
import { parseTodoList } from '/js/content.js';

test("Return if the domain is instructure", async () => {

	// global.location = {hostname: "canvas.instructure.com"};
	// jest.spyOn(location.hostname, "includes").mockResolvedValue(true);
	expect(await isDomainCanvas()).toBe(true);
});

// NOTE: We cannot test start extension through any method except log
// messages without refactoring the code. I didn't want to do this for
// fear of messing things up.
// - Summer



test("Tests if it parses a complete todo item", () => {
	const li = document.createElement("li");
	li.innerHTML = `
	  <div data-testid="todo-sidebar-item-info">
		<div data-testid="todo-sidebar-item-title">
		  <a href="/courses/3503/assignments/67">Lab 1</a>
		</div>
		<span class="css-79wf76-text">Programming Fundamentals II</span>
		<ul data-testid="ToDoSidebarItem__InformationRow">
		  <li>Feb 8</li>
		</ul>
	  </div>
	`;

	const result = parseTodoItem(li);

	expect(result).toEqual({
		title: "Lab 1",
		course: "Programming Fundamentals II",
		dueDteText: "Feb 8",
		url: "https://canvas.instructure.com/courses/3503/assignments/67",
	});
});

test("Tests if returns null if info is missing", () => {
	const li = document.createElement("li");
	const result = parseTodoItem(li);

	expect(result).toBeNull();
});


// This one has to be first because once we enter the elements, it messes
// with the test for null :)
test("Testing if it returns empty array if the list isn't found", () => {
	const result = parseTodoList();
	expect(result).toEqual([]);
});

test("Testing if it parses to do list items", async () => {
	const ul = document.createElement("ul");
	ul.id = "planner-todosidebar-item-list";
	document.body.appendChild(ul);

	// Create some todo items
	const li1 = document.createElement("li");
	li1.innerHTML = `
	  <div data-testid="todo-sidebar-item-info">
		<div data-testid="todo-sidebar-item-title">
		  <a href="/courses/3503/assignments/1">Lab 1</a>
		</div>
		<span class="css-79wf76-text">Programming Fundamentals 2</span>
		<ul data-testid="ToDoSidebarItem__InformationRow">
		  <li>Feb 8</li>
		</ul>
	  </div>
	`;
	ul.appendChild(li1);

	const li2 = document.createElement("li");
	li2.innerHTML = `
	  <div data-testid="todo-sidebar-item-info">
		<div data-testid="todo-sidebar-item-title">
		  <a href="/courses/4213/assignments/2">Security Breach Case Study</a>
		</div>
		<span class="css-79wf76-text">Enterprise Security</span>
		<ul data-testid="ToDoSidebarItem__InformationRow">
		  <li>Feb 12</li>
		</ul>
	  </div>
	`;
	ul.appendChild(li2);

	const result = parseTodoList();

	expect(result).toEqual([
		{
			title: "Lab 1",
			course: "Programming Fundamentals 2",
			dueDteText: "Feb 8",
			url: "https://canvas.instructure.com/courses/3503/assignments/1",
		},
		{
			title: "Security Breach Case Study",
			course: "Enterprise Security",
			dueDteText: "Feb 12",
			url: "https://canvas.instructure.com/courses/4213/assignments/2",
		},
	]);


});

// Testing wait for element seemed kind of silly because it's just a timer waiting
// for elements to appear

