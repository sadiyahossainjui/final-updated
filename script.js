// Define constants for API endpoint and local storage key
const API_KEY = 'bJPxIZA2hiGr28n7dj9t7BDWNj7r1DjlvXWpQebk'; // Replace with your actual NASA APOD API key
const API_URL = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;
const LOCAL_STORAGE_KEY = 'favourites';

// DOM elements
const dateForm = document.getElementById('dateForm');
const dateInput = document.getElementById('dateInput');
const apodSection = document.getElementById('apodSection');
const apodTitle = document.getElementById('apodTitle');
const apodImage = document.getElementById('apodImage');
const apodDate = document.getElementById('apodDate');
const apodExplanation = document.getElementById('apodExplanation');
const addFavorite = document.getElementById('addFavorite');
const favouritesList = document.getElementById('favouritesList');
// Event listeners
dateForm.addEventListener('submit', fetchApodByDate);
favouritesList.addEventListener('click', handleFavouriteClick);

// Fetch APOD image by date from NASA APOD API
function fetchApodByDate(event) {
    event.preventDefault();
    const date = dateInput.value;
    const url = `${API_URL}&date=${date}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.code === 400) {
                // Handle error if invalid date is entered
                alert('Invalid date. Please select a non-future date.');
            } else {
                // Update UI with APOD image data
                apodSection.hidden = false;
                apodTitle.textContent = data.title;
                apodTitle.dataset = data.title;
                apodImage.src = data.url;
                apodImage.classList.add('view');
                apodImage.alt = data.title;
                apodDate.textContent = `Date: ${data.date}`;
                apodExplanation.textContent = data.explanation;

                apodImage.addEventListener('click', function () {
                    viewHD(data.hdurl, data.title);
                });

                addFavorite.addEventListener('click', function () {

                    //check if is it image add
                    if (data.media_type === "image") {
                        if (isItemInLocalStorage(data.title)) {
                            console.log('Item exists in localStorage');
                        } else {
                            console.log('Item does not exist in localStorage');
                            addToFavorites(data);
                        }
                    }
                });
            }
        })
        .catch(error => console.error(error));
}

// Handle click events on favourites
function handleFavouriteClick(event) {
    const target = event.target;
    if (target.tagName === 'BUTTON' || target.tagName === 'IMG') {
        const listItem = target.closest('li');
        const title = listItem.dataset.title;
        const hdurl = listItem.dataset.hdurl;

        if (target.classList.contains('delete')) {
            // Delete favourite
            deleteFavourite(title);
            listItem.remove();

        } else if (target.classList.contains('view')) {
            viewHD(hdurl, title);
        }
    }
}


function addToFavorites(apodData) {
    createFovoriteItem(apodData);

    saveFavourite(apodData.title, apodData.url, apodData.date, apodData.hdurl);
}

// Save favourite to local storage
function saveFavourite(title, url, date, hdurl) {
    const favourites = getFavourites();
    localStorage.clear();
    favourites.push({ title, url, date, hdurl });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favourites));
}

// Delete favourite from local storage
function deleteFavourite(title) {
    const favourites = getFavourites();
    const updatedFavourites = favourites.filter(favourite => favourite.title !== title);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFavourites));
}

// Check if an item with a given key exists in localStorage
// Check if an item with a given key exists in localStorage
function isItemInLocalStorage(key) {
    const favourites = getFavourites();

    for (let i = 0; i < favourites.length; i++) {
        const element = favourites[i];
        if (element.title == key) {
            return true;
        }
    }

    return false;
}


// Get favourites from local storage
function getFavourites() {
    const favourites = localStorage.getItem(LOCAL_STORAGE_KEY);
    return favourites ? JSON.parse(favourites) : [];
}

// Display favourites on the page
function displayFavourites() {
    const favourites = getFavourites();
    favouritesList.innerHTML = '';

    if (favourites.length !== 0) {
        favourites.forEach(favourite => {
            createFovoriteItem(favourite);
        });
    }
}

function createFovoriteItem(favourite) {
    const listItem = document.createElement('li');
    listItem.dataset.title = favourite.title;
    listItem.dataset.url = favourite.url;
    listItem.dataset.hdurl = favourite.hdurl;
    listItem.dataset.date = favourite.date;
    favouritesList.appendChild(listItem);
    listItem.innerHTML = `
            <img class="view" src="${favourite.url}" alt="${favourite.title}">
            <div class="info">
                <h3>${favourite.title}</h3>
                <p>Date: ${favourite.date}</p>
                <button class="delete">Delete</button>
            </div>
            `;
}

// Initial setup on page load
window.addEventListener('DOMContentLoaded', () => {
    displayFavourites();

});


function viewHD(hdurl, alt) {
    // Get the modal
    let modal = document.getElementById("view-hd-modal");
    let modalImg = document.getElementById("modal-img");
    // Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];

    modalImg.src = hdurl;
    modalImg.alt = alt;

    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}