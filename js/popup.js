import { sum } from "/js/background.js";

console.log("Yeehaw! 2 + 2 = " + sum(2, 2));

const selectBtn = document.getElementById("selectBtn");

const animalToggle = document.getElementById("animalToggle");
const moodToggle = document.getElementById("moodToggle");     
const hungerToggle = document.getElementById("hungerToggle");

const dogImg = document.getElementById("dogImg");
const catImg = document.getElementById("catImg");

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
  // const animal = animalToggle.checked ? "dog" : "cat";
  chrome.storage.local.get(["selectedPet"], (data) => {
	  const animal = data.selectedPet || "cat";
	  const mood = hungerToggle.checked ? "hungry"
             : moodToggle.checked   ? "happy"
             : "normal";

	  if(PATHS[animal] && PATHS[animal][mood]) {
		  dogImg.src = PATHS["dog"][mood];
		  catImg.src = PATHS["cat"][mood];
	  }
  });
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

// animalToggle.addEventListener("change", handleAnimalToggle);
moodToggle.addEventListener("change", handleHappyToggle);
hungerToggle.addEventListener("change", handleHungryToggle);


selectBtn.addEventListener("click", () => {
	const activeItem = document.querySelector(".carousel__item--selected");

	if(activeItem) {
		const chosenPet = activeItem.getAttribute("data-pet");

		chrome.storage.local.set({ selectedPet: chosenPet }, () => {
			refreshImage();
			selectBtn.textContent = "Selected!";
			setTimeout(() => selectBtn.textContent = "Select Pet", 1000);
		});
	}
});



document.querySelectorAll(".carousel").forEach((carousel) => {
  const items = carousel.querySelectorAll(".carousel__item");
  const buttonsHtml = Array.from(items, () => {
    return `<span class="carousel__button"></span>`;
  });

  carousel.insertAdjacentHTML(
    "beforeend",
    `
		<div class="carousel__nav">
			${buttonsHtml.join("")}
		</div>
	`
  );

  const buttons = carousel.querySelectorAll(".carousel__button");

  buttons.forEach((button, i) => {
    button.addEventListener("click", () => {
      // un-select all the items
      items.forEach((item) =>
        item.classList.remove("carousel__item--selected")
      );
      buttons.forEach((button) =>
        button.classList.remove("carousel__button--selected")
      );

      items[i].classList.add("carousel__item--selected");
      button.classList.add("carousel__button--selected");
    });
  });

  // Select the first item on page load
  items[0].classList.add("carousel__item--selected");
  buttons[0].classList.add("carousel__button--selected");
});
