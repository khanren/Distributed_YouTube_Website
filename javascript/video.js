// Extract videoId from URL parameters
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

likeButton.addEventListener('click', () => updateLikeDislikeCount('like'));
dislikeButton.addEventListener('click', () => updateLikeDislikeCount('dislike'));

// Function to check if a user is logged in
function checkAuth() {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                resolve(user);
            } else {
                reject(new Error('User not logged in'));
            }
        });
    });
}

// Update like or dislike count
function updateLikeDislikeCount(action) {
    checkAuth()
        .then(user => {
            const userId = user.uid; // Get logged-in user's ID
            const userRef = database.ref(`User/${userId}`); // Reference to the User data
            const videoRef = database.ref(`LikeOrDislikeCount/${videoId}/${userId}`); // Reference to the LikeOrDislikeCount

            // Fetch the username from the database
            userRef.once('value').then(snapshot => {
                const userData = snapshot.val();
                if (userData && userData.Username) {
                    const username = userData.Username;

                    // Check if the user already liked/disliked
                    videoRef.once('value').then(snapshot => {
                        const existingData = snapshot.val();

                        if (existingData && existingData.action === action) {
                            // User already performed this action, remove it
                            videoRef.remove().then(() => updateLikeDislikeCountsDisplay());
                        } else {
                            // Add or update the action
                            videoRef.set({
                                username: username,
                                action: action
                            }).then(() => updateLikeDislikeCountsDisplay());
                        }
                    });
                } else {
                    console.error('Username not found for user:', userId);
                    alert('Unable to retrieve username. Please check your account details.');
                }
            });
        })
        .catch(() => {
            alert('Please log in to like or dislike the video.');
        });
}

// Function to update the like and dislike counts displayed on the buttons
function updateLikeDislikeCountsDisplay() {
    const videoLikesRef = database.ref(`LikeOrDislikeCount/${videoId}`);

    videoLikesRef.once('value').then(snapshot => {
        const data = snapshot.val();
        let likeCount = 0;
        let dislikeCount = 0;

        if (data) {
            Object.values(data).forEach(entry => {
                if (entry.action === 'like') {
                    likeCount++;
                } else if (entry.action === 'dislike') {
                    dislikeCount++;
                }
            });
        }

        // Update the button text with counts
        likeButton.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Like (${likeCount})`;
        dislikeButton.innerHTML = `<i class="bi bi-hand-thumbs-down"></i> Dislike (${dislikeCount})`;
    });
}

// Initialize Firebase Authentication
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(error => {
    console.error('Auth persistence error: ', error);
});

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
    updateLikeDislikeCountsDisplay(); // Update counts when the video is ready
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
