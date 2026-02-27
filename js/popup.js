import { sum } from "/js/background.js";

console.log("Yeehaw! 2 + 2 = " + sum(2, 2));

const selectBtn = document.getElementById("selectBtn");

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

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

function refreshImage() {
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

	function setSlide(index) {
		items.forEach(item => item.classList.remove("carousel__item--selected"));
		buttons.forEach(btn => btn.classList.remove("carousel__button--selected"));

		items[index].classList.add("carousel__item--selected");
		buttons[index].classList.add("carousel__button--selected");
	}


	if(nextBtn && prevBtn){
		nextBtn.addEventListener("click", () => {
			let index = Array.from(items).findIndex(item => item.classList.contains("carousel__item--selected")) + 1;
			console.log("NEXT CLICKED");
			if (index >= items.length) index = 0;
			setSlide(index);
		});

		prevBtn.addEventListener("click", () => {
			let index = Array.from(items).findIndex(item => item.classList.contains("carousel__item--selected")) - 1;
			console.log("PREV CLICKED");
			if (index < 0) index = items.length - 1;
			setSlide(index);
		});
	}
	const buttons = carousel.querySelectorAll(".carousel__button");

	buttons.forEach((button, i) => {
		button.addEventListener("click", () => setSlide(0));
	});

	// Select the first item on page load
	items[0].classList.add("carousel__item--selected");
	buttons[0].classList.add("carousel__button--selected");
});

document.querySelectorAll(".motivation-questionnaire").forEach((questionnaire) => {
	const classQ = document.querySelectorAll(".class-questions");

	classQ.forEach((classQuestion) => {
		items.forEach((question) => {
			question.insertAdjacentHTML("beforeend", 
				`
					<div class="likertLabels">
						<p>Disagree</p>
						<p>Agree</p>
					</div>
					<div class ="likertBtns">
						<input name="1" type="radio" value="1" />
						<input name="1" type="radio" value="2" />
						<input name="1" type="radio" value="3" />
						<input name="1" type="radio" value="4" />
						<input name="1" type="radio" value="5" />
					</div>
					`
			);
		});
		classQuestion.insertAdjacentHTML("beforeend",
			`
			<div class="questionnaire-nav">
				<button id="questionnaire-prev" class="questionnaire-nav-btn"> Previous </button>
				<button id="questionnaire-prev" class="questionnaire-nav-btn"> Next </button>
			</div>
			`
		);
	});

});
