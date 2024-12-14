const API_KEY = 'AIzaSyDKCdoJUDNN-SDhsKn1IbjKYfW3YLP4NIw';
const regions = ['US', 'CA', 'JP', 'IN', 'GB', 'FR', 'DE', 'AU', 'KR', 'BR']; // List of region codes
const randomRegion = regions[Math.floor(Math.random() * regions.length)]; // Pick a random region
let API_URL = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=${randomRegion}&maxResults=20&key=${API_KEY}`;
let nextPageToken = null;

const videoGrid = document.getElementById('video-grid');
const loadingIndicator = document.getElementById('loading');

document.getElementById('menu-toggle').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    // Toggle the "hidden" class
    sidebar.classList.toggle('hidden');
});

// Fetch popular videos
async function fetchVideos() {
    try {
        loadingIndicator.classList.remove('hidden');

        const url = nextPageToken ? `${API_URL}&pageToken=${nextPageToken}` : API_URL;
        const response = await fetch(url);
        const data = await response.json();

        nextPageToken = data.nextPageToken; // Update the next page token
        loadingIndicator.classList.add('hidden');

        data.items.forEach(video => {
            const videoId = video.id;
            const videoCard = document.createElement('a');
            videoCard.href = `https://www.youtube.com/watch?v=${videoId}`;
            videoCard.target = "_blank";
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

// Infinite Scroll: Load more videos as the user scrolls
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        if (nextPageToken) {
            fetchVideos();
        }
    }
});

// Fetch initial videos on page load
fetchVideos();
