import { sum } from "/js/background.js";

console.log("Yeehaw! 2 + 2 = " + sum(2, 2));

const animalToggle = document.getElementById("animalToggle");
const moodToggle = document.getElementById("moodToggle");
const imageElement = document.getElementById("myImage");


const PATHS = {
  cat: {
    normal: "/Images/Cat/CatWagTail.gif",
    happy:  "/Images/Cat/CatHappy.gif",
  },
  dog: {
    normal: "/Images/Dog/DogTailWag.gif",
    happy:  "/Images/Dog/Happy Dog.gif", 
  }
};

chrome.storage.local.get(['dogSelected'], (data) => {
	animalToggle.checked = !!data.dogSelected;
	refreshImage();
}); 

function refreshImage() {
	const animal = animalToggle.checked ? "dog" : "cat";
	const mood = moodToggle.checked ? "happy" : "normal";

	imageElement.src = PATHS[animal][mood];
}

export function handleUserClick() {
	refreshImage();

	chrome.storage.local.set({dogSelected: animalToggle.checked});
}


animalToggle.addEventListener("change", handleUserClick);
moodToggle.addEventListener("change", handleUserClick);

