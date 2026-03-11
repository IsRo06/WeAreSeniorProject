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

// NEW: this tracks what is previewed in the popup only
let previewPet = "cat1";

const PATHS = {
  cat1: {
    normal: "/Images/Cat/CatWagTail.gif",
    happy: "/Images/Cat/CatHappy.gif",
    hungry: "/Images/Cat/CatHungry.gif",
    eating: "/Images/Cat/CatEating.gif",
  },
  cat2: {
    normal: "/Images/Cat/Cat2Wag.gif",
    happy: "/Images/Cat/Cat2Happy.gif",
    hungry: "/Images/Cat/Cat2Hungry.gif",
    eating: "/Images/Cat/Cat2Eating.gif",
  },
  cat3: {
    normal: "/Images/Cat/Cat3Wag.gif",
    happy: "/Images/Cat/Cat3Happy.gif",
    hungry: "/Images/Cat/Cat3Hungry.gif",
    eating: "/Images/Cat/Cat3Eating.gif",
  },
  dog1: {
    normal: "/Images/Dog/DogTailWag.gif",
    happy: "/Images/Dog/Happy Dog.gif",
    hungry: "/Images/Dog/DogHungry.gif",
    eating: "/Images/Dog/DogEating.gif",
  },
  dog2: {
    normal: "/Images/Dog/Dog2Wag.gif",
    happy: "/Images/Dog/Dog2Happy.gif",
    hungry: "/Images/Dog/Dog2Hungry.gif",
    eating: "/Images/Dog/Dog2Eating.gif",
  },
  dog3: {
    normal: "/Images/Dog/Dog3Wag.gif",
    happy: "/Images/Dog/Dog3Happy.gif",
    hungry: "/Images/Dog/Dog3Hungry.gif",
    eating: "/Images/Dog/Dog3Eating.gif",
  },
};

function refreshImage() {
  const mood = eatingToggle?.checked
    ? "eating"
    : hungerToggle?.checked
    ? "hungry"
    : moodToggle?.checked
    ? "happy"
    : "normal";

  if (!PATHS[previewPet] || !PATHS[previewPet][mood]) {
    console.log("Missing path for:", previewPet, mood);
    return;
  }

  const activeItem = document.querySelector(".carousel__item--selected img");
  if (activeItem) {
    activeItem.src = PATHS[previewPet][mood];
  }
}

function makeExclusive(activeToggle) {
  if (!activeToggle?.checked) return;

  if (activeToggle !== moodToggle && moodToggle) moodToggle.checked = false;
  if (activeToggle !== hungerToggle && hungerToggle) hungerToggle.checked = false;
  if (activeToggle !== eatingToggle && eatingToggle) eatingToggle.checked = false;
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

if (moodToggle) {
  moodToggle.addEventListener("change", handleHappyToggle);
}
if (hungerToggle) {
  hungerToggle.addEventListener("change", handleHungryToggle);
}
if (eatingToggle) {
  eatingToggle.addEventListener("change", handleEatingToggle);
}

selectBtn.addEventListener("click", () => {
  const activeItem = document.querySelector(".carousel__item--selected");

  if (activeItem) {
    const chosenPet = activeItem.getAttribute("data-pet");

    chrome.storage.local.set({ selectedPet: chosenPet }, () => {
      selectBtn.textContent = "Selected!";
      setTimeout(() => (selectBtn.textContent = "Select Pet"), 1000);
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

  function setSlide(index) {
    items.forEach((item) => item.classList.remove("carousel__item--selected"));
    buttons.forEach((btn) => btn.classList.remove("carousel__button--selected"));

    items[index].classList.add("carousel__item--selected");
    buttons[index].classList.add("carousel__button--selected");

    // NEW: only update preview pet, do NOT save to storage
    previewPet = items[index].getAttribute("data-pet");
    refreshImage();
  }

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => {
      let index =
        Array.from(items).findIndex((item) =>
          item.classList.contains("carousel__item--selected")
        ) + 1;
      if (index >= items.length) index = 0;
      setSlide(index);
    });

    prevBtn.addEventListener("click", () => {
      let index =
        Array.from(items).findIndex((item) =>
          item.classList.contains("carousel__item--selected")
        ) - 1;
      if (index < 0) index = items.length - 1;
      setSlide(index);
    });
  }

  buttons.forEach((button, i) => {
    button.addEventListener("click", () => setSlide(i));
  });

  // Start popup on first pet visually, but do not change extension pet yet
  setSlide(0);
});

document.querySelectorAll(".motivation-questionnaire").forEach((questionnaire) => {
  const classQ = questionnaire.querySelectorAll(".class__questions");
  let currClassInd = 0;

  classQ.forEach((classQuestion) => {
    addLikertScales(classQuestion);
  });

  const nextClassBtn = document.getElementById("questionnaire-next");
  const prevClassBtn = document.getElementById("questionnaire-prev");
  const submitBtn = document.getElementById("questionnaire-submit");
  prevClassBtn.classList.add("disabled");

  function setClass(index) {
    classQ.forEach((item) => item.classList.remove("class__questions--selected"));
    classQ[index].classList.add("class__questions--selected");
  }

  classQ[0].classList.add("class__questions--selected");

  if (nextClassBtn && prevClassBtn && submitBtn) {
    nextClassBtn.addEventListener("click", () => {
      prevClassBtn.classList.remove("disabled");
      currClassInd += 1;
      if (currClassInd >= classQ.length - 1) {
        nextClassBtn.style.display = "none";
        submitBtn.style.display = "block";
      }
      setClass(currClassInd);
    });

    prevClassBtn.addEventListener("click", () => {
      currClassInd -= 1;
      nextClassBtn.style.display = "block";
      submitBtn.style.display = "none";
      if (currClassInd <= 0) {
        prevClassBtn.classList.add("disabled");
        currClassInd = 0;
      }

      setClass(currClassInd);
    });
  }
});

function submitQuestionnaire() {
  // TODO Complete submission stuff
}

function addLikertScales(classDoc, parentId) {
  const items = classDoc.querySelectorAll(".likert");
  let i = 1;
  items.forEach((question) => {
    const name = "" + classDoc.id + i;
    question.insertAdjacentHTML(
      "beforeend",
      `
        <div class="likertLabels">
          <p>Disagree</p>
          <p>Agree</p>
        </div>
        <div class ="likertBtns">
          <input name="` +
        name +
        `" type="radio" value="1" />
          <input name="` +
        name +
        `" type="radio" value="2" />
          <input name="` +
        name +
        `" type="radio" value="3" />
          <input name="` +
        name +
        `" type="radio" value="4" />
          <input name="` +
        name +
        `" type="radio" value="5" />
        </div>
        `
    );
    i++;
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