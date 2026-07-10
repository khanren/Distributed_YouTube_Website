const API_KEY = 'AIzaSyBjbMHVj0K6D31ikBF76rrlDpjWUkJmDM4';
const videoGrid = document.getElementById('video-grid');
const loadingIndicator = document.getElementById('loading');

let nextPageToken = null;
let currentSearchQuery = new URLSearchParams(window.location.search).get('query');
let isFetching = false;

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
    if (isFetching) return;
    isFetching = true;
    try {
        loadingIndicator.classList.remove('hidden');
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=50&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        
        const response = await fetch(url);
        const data = await response.json();
        nextPageToken = data.nextPageToken || null;
        loadingIndicator.classList.add('hidden');

        const items = shuffleArray(data.items.filter(item => item.id.videoId));
        if (!append) videoGrid.innerHTML = '';
        
        items.forEach(({ id, snippet }) => {
            const videoId = id.videoId;
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
    } finally {
        isFetching = false;
        loadingIndicator.classList.add('hidden');
    }
}

document.getElementById('search-form').addEventListener('submit', handleSearch);

function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('search-input').value.trim();
    if (searchInput) {
        currentSearchQuery = searchInput;
        nextPageToken = null;
        fetchVideos(currentSearchQuery);
    }
}

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && nextPageToken) {
        fetchVideos(currentSearchQuery, true);
    }
});

if (currentSearchQuery) {
    document.getElementById('search-input').value = currentSearchQuery;
    fetchVideos(currentSearchQuery);
}

document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('hidden');
});

const storedAvatar = localStorage.getItem('avatar');
if (storedAvatar) {
    document.getElementById('userAvatar').src = storedAvatar;
}