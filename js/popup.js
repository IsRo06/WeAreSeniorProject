const checkbox = document.getElementById('imageToggle');
const imageElement = document.getElementById('myImage');

checkbox.addEventListener("change", () => {
	if(checkbox.checked){
		imageElement.src = '/Images/Dog/DogStatic.png';
	}
	else{
		imageElement.src = '/Images/Cat/CatStatic.png';
	}
});

console.log("This is a popup!");
