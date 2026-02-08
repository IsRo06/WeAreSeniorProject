/*
 * @jest-environment jsdom
 * @jest-environment-options { "url": "https://canvas.instructure.com" }
 */

import { isDomainCanvas } from '/js/content.js';
import { startExtension } from '/js/content.js';
import { parseTodoItem } from '/js/content.js';

test("Return if the domain is instructure", async () => {

	// global.location = {hostname: "canvas.instructure.com"};
	// jest.spyOn(location.hostname, "includes").mockResolvedValue(true);
	expect(await isDomainCanvas()).toBe(true);
});

// NOTE: We cannot test start extension through any method except log
// messages without refactoring the code. I didn't want to do this for
// fear of messing things up.
// - Summer



test("parses a complete todo item", () => {
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

test("returns null if info is missing", () => {
	const li = document.createElement("li");
	const result = parseTodoItem(li);

	expect(result).toBeNull();
});


test("Testing if it parses to do list properly", async () => {

});


test("Testing the waiting for elements", async () => {

});

