const API_KEY = 'AIzaSyDKCdoJUDNN-SDhsKn1IbjKYfW3YLP4NIw';
const videoGrid = document.getElementById('video-grid');
const loadingIndicator = document.getElementById('loading');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const suggestionList = document.getElementById('suggestion-list');

// Define an array of region codes for randomization
const regions = ['US', 'CA', 'JP', 'IN', 'GB', 'FR', 'DE', 'AU', 'KR', 'BR'];
const randomRegion = regions[Math.floor(Math.random() * regions.length)];

let nextPageToken = null;
let isSearchMode = false;
let currentSearchQuery = '';

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Fetch keyword suggestions
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

// Fetch videos
async function fetchVideos(searchQuery = '', append = false) {
    try {
        loadingIndicator.classList.remove('hidden');

        let url = searchQuery
            ? `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
                  searchQuery
              )}&type=video&maxResults=50&key=${API_KEY}`
            : `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=${randomRegion}&maxResults=50&key=${API_KEY}`;

        if (nextPageToken) url += `&pageToken=${nextPageToken}`;

        const response = await fetch(url);
        const data = await response.json();

        nextPageToken = data.nextPageToken || null;
        loadingIndicator.classList.add('hidden');

        let items = searchQuery
            ? data.items.filter((item) => item.id.videoId)
            : data.items;

        // Shuffle the items for randomness
        items = shuffleArray(items);

        if (!append) videoGrid.innerHTML = '';

        items.forEach((video) => {
            const videoId = searchQuery ? video.id.videoId : video.id;
            const videoCard = document.createElement('a');
            videoCard.href = `https://www.youtube.com/watch?v=${videoId}`;
            videoCard.target = '_blank';
            videoCard.classList.add('video-card');

            videoCard.innerHTML = `
                <div class="video-thumbnail bg-gray-700 h-36">
                    <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}" class="w-full h-full object-cover">
                </div>
                <h2 class="mt-2 text-sm font-medium">${video.snippet.title}</h2>
                <p class="text-xs text-gray-400">${video.snippet.channelTitle}</p>
            `;

            videoGrid.appendChild(videoCard);
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
}

// Handle suggestions
searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (!query) {
        suggestionList.classList.add('d-none');
        return;
    }
    const suggestions = await fetchSuggestions(query);
    showSuggestions(suggestions);
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionList.contains(e.target)) {
        suggestionList.classList.add('d-none');
    }
});

// Handle form submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        currentSearchQuery = query;
        nextPageToken = null;
        fetchVideos(query);
    }
});

// Infinite scroll
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && nextPageToken) {
        fetchVideos(currentSearchQuery, true);
    }
});

// Initial fetch
fetchVideos();

document.getElementById('menu-toggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    // Toggle the "hidden" class
    sidebar.classList.toggle('hidden');
});

document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const username = localStorage.getItem("username");
    const avatar = localStorage.getItem("avatar");

    const userAvatar = document.getElementById("userAvatar");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    if (isLoggedIn) {
        userAvatar.src = avatar || "https://via.placeholder.com/40";
        dropdownMenu.innerHTML = `
            <li><a class="dropdown-item" href="#">Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item logout" href="#">Logout</a></li>
        `;

        document.querySelector(".logout").addEventListener("click", () => {
            localStorage.clear();
            location.reload();
        });
    } else {
        dropdownMenu.innerHTML = `
            <li><a class="dropdown-item" href="login.html">Log in</a></li>
        `;
    }
});