# CANVAS PETS

This repository contains the code for our canvas extension known as "Canvas Pets". This extension allows users to add interactive and animated pets to their canvas workspace, enhancing the user experience with fun and engaging elements. The aim of our project is to provide students with an engaging way of completing their assignments through the gamification of an otherwise monotone e-learning environment. We believe this extension will help students complete their assignments and stay motivated while doing so.

# Setup

## git clone

Using the https link under "Code", downloads the repository's code onto your personal computer.

# Testing

- Go to chrome://extensions/
- Enable "Developer mode" using the toggle in the top right corner
- Click on "Load unpacked" and select the directory where you cloned the repository
- The extension should now be loaded and ready to use
- Open Canvas and click on the extension icon to test the current functionality which is currently displaying "Hello World!" in a popup
- Click on the three dots at the top right of chrome, look for more tools, then developer tools. This will open up a console with logs, which currently print the to-do list of assignments.
       
# Notes

The manifest.json file describes the extension's properties and permissions. The popup.html and popup.js files define the content and behavior of the extension's popup window. Further development is needed to implement the full functionality of adding interactive pets to the canvas workspace

The developer tool console will print several "failed to load resource" errors before the to-do list logs. This is expected and can be ignored as it seems to be related to canvas's internal resources that the extension is trying to access. The important part is that the to-do list logs are printed, indicating that the extension is successfully retrieving the list of assignments from canvas.
