const checkbox = document.getElementById('imageToggle');
const imageElement = document.getElementById('myImage');

checkbox.addEventListener("change", () => {
	if(checkbox.checked){
		imageElement.src = '/Images/Dog/DogWagTail.gif';
	}
	else{
		imageElement.src = '/Images/Cat/CatWagTail.gif';
	}
});

console.log("This is a popup!");
