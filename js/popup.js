console.log("Welcome to Canvas Pets!");

const selectBtn = document.getElementById("selectBtn");

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

const moodToggle = document.getElementById("moodToggle");     
const hungerToggle = document.getElementById("hungerToggle");
const eatingToggle = document.getElementById("eatingToggle");

const dogImg = document.getElementById("dogImg");
const catImg = document.getElementById("catImg");

const imageElement = document.getElementById("myImage");


const toQuestionnaireBtn = document.getElementById("toQuestionnaire");
const toCustomizationBtn = document.getElementById("toCustomization");

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

function refreshImage() {
	chrome.storage.local.get(["selectedPet"], (data) => {
		const animal = data.selectedPet || "cat";
		const mood = eatingToggle.checked ? "eating" 
			: hungerToggle.checked ? "hungry"
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

moodToggle.addEventListener("change", handleHappyToggle);
hungerToggle.addEventListener("change", handleHungryToggle);
eatingToggle.addEventListener("change", handleEatingToggle);


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
			if (index >= items.length) index = 0;
			setSlide(index);
		});

		prevBtn.addEventListener("click", () => {
			let index = Array.from(items).findIndex(item => item.classList.contains("carousel__item--selected")) - 1;
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
	const classQ = questionnaire.querySelectorAll(".class__questions");
	let currClassInd = 0;

	classQ.forEach((classQuestion) => {
		createQuestionnaire(classQuestion);
	});

	const nextClassBtn = document.getElementById("questionnaire-next");
	const prevClassBtn = document.getElementById("questionnaire-prev");
	const submitBtn = document.getElementById("questionnaire-submit");
	prevClassBtn.classList.add("disabled");

	function setClass(index) {
		classQ.forEach(item => item.classList.remove("class__questions--selected"));
		classQ[index].classList.add("class__questions--selected");

	}


	classQ[0].classList.add("class__questions--selected");

	if(nextClassBtn && prevClassBtn && submitBtn){
		nextClassBtn.addEventListener("click", () => {
			prevClassBtn.classList.remove("disabled");
			currClassInd += 1;
			if(currClassInd >= classQ.length - 1){
				nextClassBtn.style.display = "none";
				submitBtn.style.display = "block";
			}
			setClass(currClassInd);
		});

		prevClassBtn.addEventListener("click", () => {
			currClassInd -= 1;
			nextClassBtn.style.display = "block";
			submitBtn.style.display = "none";
			if(currClassInd <= 0){
				prevClassBtn.classList.add("disabled");
				currClassInd = 0;
			}

			setClass(currClassInd);
		});
	}

	// Select the first item on page load

});

function submitQuestionnaire(){
	// TODO Complete submission stuff
}

function createQuestionnaire(classDoc){
		classDoc.insertAdjacentHTML("beforeend",
			`
						<p class="class-prompt">I am taking this class because...</P>
						<div class="questions-wrapper">
							<div class="likert">
								<p class="likertQuestion">I'm interested in the subject matter</p>
							</div>
							<div class="likert">
								<p class="likertQuestion">I like the professor</p>
							</div>
							<div class="likert">
								<p class="likertQuestion">It's important to my career</p>
							</div>
							<div class="likert">
								<p class="likertQuestion">It fits my schedule</p>
							</div>
							<div class="likert">
								<p class="likertQuestion">It fits a general education requirement</p>
							</div>
							<div class="likert">
								<p class="likertQuestion">It is required for my major</p>
							</div>
							<div class="likert">
								<p class="likertQuestion">I think it'll be a valuable experience</p>
							</div>
							<label class="likertQuestion" for="additional-thoughts">Additional thoughts...</p>
								<textarea id="additional-thoughts" name="additional-thoughts" rows="4" cols="40">More information on why you're taking this class...</textarea>
						</div>
			`
		);
		addLikertScales(classDoc);
}

function addLikertScales(classDoc){
		const items = classDoc.querySelectorAll(".likert");
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
}



toQuestionnaireBtn.addEventListener("click", () => {
	const customizeScreen = document.getElementById("customizeScreen");     
	const questionnaireScreen = document.getElementById("questionnaireScreen");     

	customizeScreen.classList.remove("screen--selected");
	customizeScreen.classList.add("screen");
	
	questionnaireScreen.classList.add("screen--selected");
	questionnaireScreen.classList.remove("screen");
});

toCustomizationBtn.addEventListener("click", () => {
	const customizeScreen = document.getElementById("customizeScreen");     
	const questionnaireScreen = document.getElementById("questionnaireScreen");     

	questionnaireScreen.classList.remove("screen--selected");
	questionnaireScreen.classList.add("screen");
	
	customizeScreen.classList.add("screen--selected");
	customizeScreen.classList.remove("screen");
});
