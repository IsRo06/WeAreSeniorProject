export function sum(a, b) {
  return a + b;
}


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "openMotivation") {
    chrome.windows.create({
      url: chrome.runtime.getURL("/html/main.html"), 
      type: "popup",
      width: 250,
      height: 600
    });
  }
});
