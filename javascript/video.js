const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('videoId');
const videoTitle = document.getElementById('video-title');
const recommendedList = document.getElementById('recommended-list');

let player; // Global player variable

// YouTube IFrame API will call this function when ready
function onYouTubeIframeAPIReady() {
    if (videoId) {
        player = new YT.Player('player', {
            videoId: videoId,
            playerVars: {
                autoplay: 1,         // Automatically play the video
                controls: 1,         // Show player controls
                rel: 0,              // Don't show related videos at the end
                modestbranding: 1    // Minimal YouTube branding
            },
            events: {
                onReady: onPlayerReady,
                onError: onPlayerError
            }
        });
    } else {
        videoTitle.innerText = 'Video not found!';
    }
}

// Play the video when the player is ready
function onPlayerReady(event) {
    event.target.playVideo();
}

// Handle errors gracefully
function onPlayerError(event) {
    console.error('Error with the YouTube Player:', event.data);
}

// Fetch recommended videos
async function fetchRecommendedVideos() {
    if (!videoId) return;

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=10&key=AIzaSyDKCdoJUDNN-SDhsKn1IbjKYfW3YLP4NIw`);
    const data = await response.json();

    if (data.items) {
        data.items.forEach((video) => {
            const relatedVideoId = video.id.videoId;
            const videoThumbnail = video.snippet.thumbnails.medium.url;
            const videoTitle = video.snippet.title;
            const channelTitle = video.snippet.channelTitle;

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <img src="${videoThumbnail}" alt="${videoTitle}" class="img-fluid">
                <div>
                    <h6>${videoTitle}</h6>
                    <p>${channelTitle}</p>
                </div>
            `;
            listItem.onclick = () => {
                window.location.href = `video.html?videoId=${relatedVideoId}`;
            };

            recommendedList.appendChild(listItem);
        });
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchRecommendedVideos();
});
