let port = 3000;
let container = document.querySelector(".SiteContainer");

container.innerHTML = `<div class="noGalleries">You have no galleries</div>`
container.querySelector(".noGalleries").style.display = "none";
GetGalleries();

function addGalleryFuctionality(gallery){
    gallery.addEventListener("click", handleEventListener)
}

function handleEventListener(event){
    event.preventDefault();
    document.body.style.pointerEvents = "none";
    let chosenGallery = event.target.parentNode.getAttribute('data-value');
    sessionStorage.setItem('currentGallery', chosenGallery);
    window.open("../Html/viewPictures.html", "_self");
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
        console.log(data)
        if(data.length < 1){
            container.querySelector(".noGalleries").style.display = "block";
        }
        else{
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
                    const galleryDiv = document.createElement('div');
                    galleryDiv.classList.add('galleryContainer');
                    galleryDiv.setAttribute('data-value', gallery.galleryId);

                    const imageElement = document.createElement('img');
                    imageElement.classList.add('galleryImage');
                    imageElement.src = `${picture.image}`;

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
                    addGalleryFuctionality(galleryDiv)
                })
                .catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                });
            });
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}
