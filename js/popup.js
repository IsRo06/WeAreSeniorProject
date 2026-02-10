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

function updatePet() {
  const isDog = animalToggle.checked;
  const isHappy = moodToggle.checked;

  const animal = isDog ? "dog" : "cat";
  const mood = isHappy ? "happy" : "normal";

  imageElement.src = PATHS[animal][mood];
}

updatePet();

animalToggle.addEventListener("change", updatePet);
moodToggle.addEventListener("change", updatePet);
