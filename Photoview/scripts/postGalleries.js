let port = 3000;
let container = document.querySelector(".SiteContainer");
let currentPicture = sessionStorage.getItem("currentPicture");
var nameInput = document.querySelector("#nameInput"); 

GetGalleries();

function getGalleryData(callback) {
    const galleryData = {
      name: nameInput.value,
      galleryId: null
    }
    callback(galleryData);
  };

document.querySelector(".createGallery").addEventListener("click", () => {
  document.body.style.pointerEvents = "none";
  if(nameInput.value != ""){
    getGalleryData(async (galleryData) => {
      await fetch(`http://localhost:${port}/api/Galleries/add`, {
        method: "POST",
        body: JSON.stringify(galleryData),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          addToGallery(data.galleryId);
        })
        .catch((error) => console.error(error));
    });
  }
});

function addGalleryFuctionality(gallery){
  gallery.addEventListener("click", handleEventListener)
}

function handleEventListener(event){
  event.preventDefault();
  document.body.style.pointerEvents = "none";
  let galleryId = event.target.parentNode.getAttribute('data-value');
  addToGallery(galleryId);
}

function addToGallery(galleryId){
    fetch(`http://localhost:${port}/api/pictures/${currentPicture}/addToGallery/${galleryId}`, {
        method: 'PUT'
      })
        .then((response) => response.json())
        .then((data) => {
          window.open("../index.html", "_self");
        })
        .catch((error) => {
          console.error(error);
        });
}

async function GetGalleries(){
await fetch(`http://localhost:${port}/api/galleries`)
.then(response => {
    if (!response.ok) {
    throw new Error('Network response was not ok');
    }
    return response.json();
    })
    .then(async (data) => {
        await data.forEach(async (gallery) => {
            console.log(gallery)
            await fetch(`http://localhost:${port}/api/galleries/pictureSearch/${gallery.galleryId}`)
            .then(response => {
                if (!response.ok) {
                throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(picture => {
                console.log(picture)
                let Base64String = picture.image;

                const galleryDiv = document.createElement('div');
                galleryDiv.classList.add('galleryContainer');
                galleryDiv.setAttribute('data-value', gallery.galleryId);

                const imageElement = document.createElement('img');
                imageElement.classList.add('galleryImage');
                imageElement.src = `${Base64String}`;

                const titleElement = document.createElement('div');
                titleElement.classList.add('galleryTitle');
                titleElement.textContent = gallery.name;

                imageElement.addEventListener('load', function() {
                  if (imageElement.naturalWidth > imageElement.naturalHeight) {
                    imageElement.style.height = '100%';
                  } else {
                    imageElement.style.width = '100%';
                  }
                });

                galleryDiv.appendChild(imageElement);
                galleryDiv.appendChild(titleElement);


                // Append the gallery div to the container
                container.appendChild(galleryDiv);
                addGalleryFuctionality(galleryDiv);
            })
            .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
            });
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}
