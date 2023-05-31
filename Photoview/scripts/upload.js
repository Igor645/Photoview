var port = 3000;
var nameInput = document.querySelector("#nameInput"); 
var descriptionInput = document.querySelector("#descriptionInput");
var fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", (event) => {
  event.preventDefault();
  image = convertToBase64();
});


function convertToBase64() {
    const file = fileInput.files[0];
    const reader = new FileReader();
    var base64Image;
  
    reader.readAsDataURL(file);
  
    reader.onload = function () {
      base64Image = reader.result;
      document.querySelector(".imagePreview").src = base64Image;
    };
  
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
}

function getImageData(callback) {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = function () {
    const base64Image = reader.result;
    const characterData = {
      title: nameInput.value,
      image: base64Image,
      description: descriptionInput.value,
      galleries: [],
      pictureId: null
    };
    callback(characterData);
  };
}


document.querySelector(".confirmUpload").addEventListener("click", () => {
  if(nameInput.value != "" && descriptionInput.value != "" && fileInput.files[0] != null){
    document.body.style.pointerEvents = "none";
    getImageData(async (characterData) => {
      await fetch(`http://localhost:${port}/api/Pictures/add`, {
        method: "POST",
        body: JSON.stringify(characterData),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          sessionStorage.setItem('currentPicture', data.pictureId);
          window.open("../Html/postGalleries.html", "_self");
        })
        .catch((error) => console.error(error));
    });
  }
});