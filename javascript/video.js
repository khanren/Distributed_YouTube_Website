const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('videoId');
const videoTitle = document.getElementById('video-title');
const recommendedList = document.getElementById('recommended-list');

let player; // Global player variable

// Firebase Configuration
var firebaseConfig = {
    apiKey: "AIzaSyCCoYF6WOiJF6aUDDf0bbAH5OjE64jr064",
    authDomain: "distributed-4f324.firebaseapp.com",
    projectId: "distributed-4f324",
    storageBucket: "distributed-4f324.firebasestorage.app",
    messagingSenderId: "1039372735541",
    appId: "1:1039372735541:web:0e7a763807cbf70891cd7c",
    measurementId: "G-TFQK6LP2GK",
    databaseURL: "https://distributed-4f324-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Add event listeners to like and dislike buttons
const likeButton = document.getElementById('like-button');
const dislikeButton = document.getElementById('dislike-button');

if (likeButton && dislikeButton) {
    likeButton.addEventListener('click', () => updateLikeDislikeCount('likes'));
    dislikeButton.addEventListener('click', () => updateLikeDislikeCount('dislikes'));
} else {
    console.error('Like or Dislike button not found in DOM');
}

function updateLikeDislikeCount(type) {
    if (videoId) {
        const videoRef = database.ref('videos/' + videoId);
        videoRef.transaction((video) => {
            if (!video) {
                video = { likes: 0, dislikes: 0 };
            }
            if (type === 'likes') {
                video.likes = (video.likes || 0) + 1;
            } else if (type === 'dislikes') {
                video.dislikes = (video.dislikes || 0) + 1;
            }
            return video;
        }, (error, committed, snapshot) => {
            if (error) {
                console.error('Transaction failed: ', error);
            } else if (!committed) {
                console.log('Transaction not committed');
            } else {
                console.log('Transaction succeeded: ', snapshot.val());
            }
        });
    } else {
        console.error('Video ID not found!');
    }
}

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

    try {
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
    } catch (error) {
        console.error('Error fetching recommended videos:', error);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchRecommendedVideos();
});
