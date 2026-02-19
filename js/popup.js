import { sum } from '/js/background.js'

console.log("Yeehaw! 2 + 2 = " + sum(2, 2));

const checkbox = document.getElementById('imageToggle');
const imageElement = document.getElementById('myImage');

checkbox.addEventListener("change", () => {
	if(checkbox.checked){
		imageElement.src = '/assets/images/Dog/DogWagTail.gif';
	}
	else{
		imageElement.src = '/assets/images/Cat/CatWagTail.gif';
	}
});

