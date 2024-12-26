const API_KEY = 'AIzaSyBhMPZUpH_HE_otU_kOWd-Zra91EoayeP0';
const videoGrid = document.getElementById('video-grid');
const loadingIndicator = document.getElementById('loading');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const suggestionList = document.getElementById('suggestion-list');

let nextPageToken = null;
let currentSearchQuery = '';

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function redirectToVideoPage(videoId) {
    window.location.href = `video.html?videoId=${videoId}`;
}

async function fetchVideos(searchQuery = '', append = false) {
    try {
        loadingIndicator.classList.remove('hidden');
        const url = searchQuery
            ? `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=50&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
            : `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=50&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        
        const response = await fetch(url);
        const data = await response.json();
        nextPageToken = data.nextPageToken || null;
        loadingIndicator.classList.add('hidden');

        const items = shuffleArray(searchQuery ? data.items.filter(item => item.id.videoId) : data.items);
        if (!append) videoGrid.innerHTML = '';
        
        items.forEach(({ id, snippet }) => {
            const videoId = searchQuery ? id.videoId : id;
            const videoCard = document.createElement('div');
            videoCard.classList.add('video-card');
            videoCard.onclick = () => redirectToVideoPage(videoId);
            videoCard.innerHTML = `
                <div class="video-thumbnail">
                    <img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}">
                </div>
                <h2>${snippet.title}</h2>
                <p>${snippet.channelTitle}</p>
            `;
            videoGrid.appendChild(videoCard);
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
}

async function fetchSuggestions(query) {
    try {
        const response = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data[1];
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

function showSuggestions(suggestions) {
    suggestionList.innerHTML = suggestions
        .map(suggestion => `<li class="list-group-item">${suggestion}</li>`)
        .join('');
    suggestionList.classList.remove('d-none');
}

searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (!query) {
        suggestionList.classList.add('d-none');
        return;
    }
    const suggestions = await fetchSuggestions(query);
    showSuggestions(suggestions);
});

searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    }
});

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && nextPageToken) {
        fetchVideos(currentSearchQuery, true);
    }
});

fetchVideos();

document.getElementById('menu-toggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    const userAvatar = document.getElementById('userAvatar');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (isLoggedIn) {
        userAvatar.src = avatar || 'https://via.placeholder.com/40';
        dropdownMenu.innerHTML = `
            <li><a class="dropdown-item" href="#">Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item logout" href="#">Logout</a></li>
        `;
        document.querySelector('.logout').addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('email');
            localStorage.removeItem('username');
            localStorage.removeItem('avatar');
            localStorage.removeItem('uid'); // Remove the uid from local storage
            window.location.href = 'index.html';
        });
    } else {
        dropdownMenu.innerHTML = `
            <li><a class="dropdown-item" href="login.html">Log in</a></li>
        `;
    }
});

function logoutUser() {
    // Check if the user is logged in using isLoggedIn
    if (localStorage.getItem("isLoggedIn") === "true") {
        console.log('Logging out user...');

        // Clear all Local Storage keys
        localStorage.clear();

        // Clear Cookies
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/"; 
        });

        // Clear Cache
        if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        return caches.delete(cacheName);
                    })
                );
            });
        }

        // Redirect or reload after logout
        console.log('User logged out successfully.');
        window.location.href = "login.html"; // Redirect to login page
    } else {
        console.log('No user is currently logged in.');
        alert('No user is currently logged in.');
    }
}