import { sum } from "/js/background.js";

console.log("Yeehaw! 2 + 2 = " + sum(2, 2));

const animalToggle = document.getElementById("animalToggle");
const moodToggle = document.getElementById("moodToggle");     
const hungerToggle = document.getElementById("hungerToggle");
const imageElement = document.getElementById("myImage");

const PATHS = {
  cat: {
    normal: "/Images/Cat/CatWagTail.gif",
    happy:  "/Images/Cat/CatHappy.gif",
    hungry: "/Images/Cat/CatHungry.gif",
  },
  dog: {
    normal: "/Images/Dog/DogTailWag.gif",
    happy:  "/Images/Dog/Happy Dog.gif",
    hungry: "/Images/Dog/DogHungry.gif",
  },
};

chrome.storage.local.get(["dogSelected"], (data) => {
  animalToggle.checked = !!data.dogSelected;
  refreshImage();
});

function refreshImage() {
  const animal = animalToggle.checked ? "dog" : "cat";

  const mood = hungerToggle.checked ? "hungry"
             : moodToggle.checked   ? "happy"
             : "normal";

  imageElement.src = PATHS[animal][mood];
}

function handleAnimalToggle() {
  chrome.storage.local.set({ dogSelected: animalToggle.checked });
  refreshImage();
}

//mutually exclusive happy and hungry toggles
function handleHappyToggle() {
  if (moodToggle.checked) {
    hungerToggle.checked = false;
  }
  refreshImage();
}

function handleHungryToggle() {
  if (hungerToggle.checked) {
    moodToggle.checked = false;
  }
  refreshImage();
}

animalToggle.addEventListener("change", handleAnimalToggle);
moodToggle.addEventListener("change", handleHappyToggle);
hungerToggle.addEventListener("change", handleHungryToggle);
