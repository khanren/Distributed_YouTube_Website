const API_KEY = 'AIzaSyBjbMHVj0K6D31ikBF76rrlDpjWUkJmDM4';
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

async function fetchVideoDetails(videoIds) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error fetching video details:', error);
        return [];
    }
}

function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
    return `${hours ? hours + ':' : ''}${minutes ? (hours && minutes < 10 ? '0' : '') + minutes + ':' : '0:'}${seconds < 10 ? '0' : ''}${seconds}`;
}

async function fetchVideos(searchQuery = '', append = false) {
    try {
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
        const url = searchQuery
            ? `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=50&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
            : `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=50&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        
        const response = await fetch(url);
        const data = await response.json();
        nextPageToken = data.nextPageToken || null;
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }

        const items = shuffleArray(searchQuery ? data.items.filter(item => item.id.videoId) : data.items);
        if (!append && videoGrid) videoGrid.innerHTML = '';

        const videoIds = items.map(item => searchQuery ? item.id.videoId : item.id);
        const videoDetails = await fetchVideoDetails(videoIds);
        const videoDetailsMap = videoDetails.reduce((acc, item) => {
            acc[item.id] = item.contentDetails.duration;
            return acc;
        }, {});

        items.forEach(({ id, snippet }) => {
            const videoId = searchQuery ? id.videoId : id;
            const duration = formatDuration(videoDetailsMap[videoId]);
            const videoCard = document.createElement('div');
            videoCard.classList.add('video-card');
            videoCard.onclick = () => redirectToVideoPage(videoId);
            videoCard.innerHTML = `
                <div class="video-thumbnail">
                    <img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}">
                    <span class="video-duration">${duration}</span>
                </div>
                <h2>${snippet.title}</h2>
                <p>${snippet.channelTitle}</p>
            `;
            if (videoGrid) videoGrid.appendChild(videoCard);
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
            <li><a class="dropdown-item" href="settings.html">Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item logout" href="#">Logout</a></li>
        `;
        document.querySelector('.logout').addEventListener('click', () => {
            localStorage.clear(); // Clear all local storage completely
            window.location.href = 'index.html';
        });
        document.querySelector('.dropdown-item[href="settings.html"]').addEventListener('click', (e) => {
            e.preventDefault();
            if (isLoggedIn) {
                window.location.href = 'settings.html';
            } else {
                alert('You need to be logged in to access the settings page.');
            }
        });
    } else {
        dropdownMenu.innerHTML = `
            <li><a class="dropdown-item" href="login.html" id="login-link">Log in</a></li>
        `;
        document.getElementById('login-link').addEventListener('click', () => {
            // Save the current page before login
            const currentPage = window.location.href;
            localStorage.setItem("redirectAfterLogin", currentPage);
        });
    }
});

function logoutUser() {
    if (localStorage.getItem("isLoggedIn") === "true") {
        console.log('Logging out user...');

        // Clear all local storage completely
        localStorage.clear();
        localStorage.removeItem('password');

        // Clear session storage as well, if used
        sessionStorage.clear();

        // Clear cookies
        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        });

        // Clear caches
        if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        return caches.delete(cacheName);
                    })
                );
            });
        }

        console.log('All local and session storage cleared. User logged out successfully.');
        window.location.href = "login.html";
    } else {
        console.log('No user is currently logged in.');
        alert('No user is currently logged in.');
    }
}

