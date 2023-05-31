let port = 3000;
let container = document.querySelector(".SiteContainer");
let currentGallery = sessionStorage.getItem("currentGallery");

container.innerHTML = `<div class="noGalleries">This Gallery doesn't exist</div>`
container.querySelector(".noGalleries").style.display = "none";
GetPictures();

function addPictureFunctionality(picture){
    picture.forEach(pic => {
        pic.addEventListener("click", (event) => {
        event.preventDefault();

        container.innerHTML += `
        <div class="overlay"></div>
        <div class="pictureView">
        <div class="xContainer"><div class="x">X</div></div>
        <img class="detailImage" src="${event.target.src}"/>
        </div>`
        var overlay = document.querySelector('.overlay');
        overlay.classList.add('active');
        const imageElement = document.querySelector(".detailImage");
        imageElement.style.width = '0%';

        GetOnePicture(imageElement, overlay);
    })
})
}

async function GetOnePicture(imageElement, overlay){
    await fetch(`http://localhost:${port}/api/pictures/${event.target.getAttribute("data-value")}`)
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response.json();
            })
            .then(async (data) => {
                const viewContainer = document.querySelector(".pictureView");
                let height;
                let currentHeight;
                    if (imageElement.naturalWidth > imageElement.naturalHeight) {
                        imageElement.style.height = 'auto';
                        imageElement.style.width = '90%';
                        viewContainer.classList.add("horizontal");
                        viewContainer.innerHTML += `        
                        <div class="DetailContainer horizontal">
                        <div class="imageName horizontal">Image Details</div>
                        <div class="inputGroup horizontal">
                            <div class="inputDemand">Name</div>
                            <div class="name">${data.title}</div>
                        </div>
                        <div class="inputGroup horizontal">
                            <div class="inputDemand">Description</div>
                            <div class="description">${data.description}</div>
                        </div>
                        </div>
                        <div class="interactionContainer">
                        <div class="deleteButton" id="${data.pictureId}">Delete</div>
                        </div>`

                        height = viewContainer.offsetHeight;
                        currentHeight = increaseBodyHeight(height) + 'px';
                    } else {
                    imageElement.style.width = '50%';
                    imageElement.style.height = 'auto';
                    viewContainer.classList.add("vertical");
                    viewContainer.innerHTML += `        
                    <div class="DetailContainer vertical">
                    <div class="imageName vertical">Image Details</div>
                    <div class="inputGroup vertical">
                        <div class="inputDemand">Name</div>
                        <div class="name">${data.title}</div>
                    </div>
                    <div class="inputGroup">
                        <div class="inputDemand vertical">Description</div>
                        <div class="description">${data.description}</div>
                    </div>
                    </div>
                    <div class="interactionContainer">
                    <div class="deleteButton" id="${data.pictureId}">Delete</div>
                    </div>`

                    height = viewContainer.offsetHeight;
                    currentHeight = increaseBodyHeight(height) + 'px';
                }

                viewContainer.querySelector(".deleteButton").addEventListener("click", async (event) => {
                    event.preventDefault();
                    document.body.style.pointerEvents = "none";

                    await fetch(`http://localhost:${port}/api/deletePictures/${event.target.id}`, {
                      method: 'DELETE',
                    })
                      .then(response => {
                        if (response.ok) {
                          console.log('Picture deleted successfully');
                        } else {
                          throw new Error('Failed to delete picture');
                        }
                        viewContainer.remove();
                        overlay.classList.remove('active');
                        location.reload();
                      })
                      .catch(error => {
                        console.error(error);
                      });
                })

                viewContainer.querySelector(".x").addEventListener("click", (event) => {
                    event.preventDefault();
                    viewContainer.remove();
                    document.querySelector(".SiteContainer").style.height = currentHeight;
                    overlay.classList.remove('active');
                    addPictureFunctionality(document.querySelectorAll(".pictureContainer"));
                })
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            }); 
}

async function GetPictures(){
await fetch(`http://localhost:${port}/api/searchPictures/${currentGallery}`)
.then(response => {
    if (!response.ok) {
    throw new Error('Network response was not ok');
    }
    return response.json();
    })
    .then(async (data) => {
        if(data.length < 1){
            container.querySelector(".noGalleries").style.display = "block";
        }
        data.forEach(picture => {
            const pictureContainer = document.createElement('div');
            pictureContainer.classList.add('pictureContainer');

            const pictureImg = document.createElement('img');
            pictureImg.classList.add('picture');
            pictureImg.src = picture.image;
            pictureImg.setAttribute('data-value', picture.pictureId);

            const captionDiv = document.createElement('div');
            captionDiv.classList.add('caption');
            captionDiv.textContent = picture.title;

            pictureContainer.appendChild(pictureImg);
            pictureContainer.appendChild(captionDiv);

            container.appendChild(pictureContainer);
            addPictureFunctionality([pictureContainer]);
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function increaseBodyHeight(height){
    let newHeight = 0;
    let currentHeight = document.querySelector(".SiteContainer").offsetHeight;
    if (currentHeight < height) {
        newHeight = (height + 100) + 'px';
        document.querySelector(".SiteContainer").style.height = newHeight; // Set body height to desired height plus extra (100 pixels in this example)
    }
    return currentHeight;
}
