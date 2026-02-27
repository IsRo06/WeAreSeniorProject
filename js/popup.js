console.log("Welcome to Canvas Pets!");

const animalToggle = document.getElementById("animalToggle");
const moodToggle = document.getElementById("moodToggle");     
const hungerToggle = document.getElementById("hungerToggle");
const eatingToggle = document.getElementById("eatingToggle");
const imageElement = document.getElementById("myImage");

const PATHS = {
  cat: {
    normal: "/Images/Cat/CatWagTail.gif",
    happy:  "/Images/Cat/CatHappy.gif",
    hungry: "/Images/Cat/CatHungry.gif",
    eating: "/Images/Cat/CatEating.gif",
  },
  dog: {
    normal: "/Images/Dog/DogTailWag.gif",
    happy:  "/Images/Dog/Happy Dog.gif",
    hungry: "/Images/Dog/DogHungry.gif",
    eating: "/Images/Dog/DogEating.gif",
  },
};

chrome.storage.local.get(["dogSelected"], (data) => {
  animalToggle.checked = !!data.dogSelected;
  refreshImage();
});

function refreshImage() {
  const animal = animalToggle.checked ? "dog" : "cat";

  const mood = eatingToggle.checked ? "eating" 
             : hungerToggle.checked ? "hungry"
             : moodToggle.checked   ? "happy"
             : "normal";

  imageElement.src = PATHS[animal][mood];
}

function handleAnimalToggle() {
  chrome.storage.local.set({ dogSelected: animalToggle.checked });
  refreshImage();
}

function makeExclusive(activeToggle) {
  if (!activeToggle.checked) return;

  if (activeToggle !== moodToggle)   moodToggle.checked = false;
  if (activeToggle !== hungerToggle) hungerToggle.checked = false;
  if (activeToggle !== eatingToggle) eatingToggle.checked = false;
}

function handleHappyToggle() {
  makeExclusive(moodToggle);
  refreshImage();
}

function handleHungryToggle() {
  makeExclusive(hungerToggle);
  refreshImage();
}

function handleEatingToggle() {
  makeExclusive(eatingToggle);
  refreshImage();
}

animalToggle.addEventListener("change", handleAnimalToggle);
moodToggle.addEventListener("change", handleHappyToggle);
hungerToggle.addEventListener("change", handleHungryToggle);
eatingToggle.addEventListener("change", handleEatingToggle);