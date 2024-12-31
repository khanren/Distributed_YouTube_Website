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

const API_KEY = 'AIzaSyBhMPZUpH_HE_otU_kOWd-Zra91EoayeP0';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    fetchWatchedVideos();
});

// Function to sanitize email for Firebase keys
function sanitizeEmail(email) {
    return email.replace(/[.#$[\]]/g, ',');
}

// Function to fetch video details from YouTube Data API
async function fetchVideoDetails(videoId) {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const snippet = data.items[0].snippet;
            return {
                title: snippet.title,
                description: snippet.description,
                thumbnail: snippet.thumbnails.medium.url, // Use the medium-quality thumbnail
            };
        } else {
            console.warn(`No details found for video ID: ${videoId}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching video details:', error);
        return null;
    }
}

// Function to fetch watched videos from Firebase and populate the history
function fetchWatchedVideos() {
    const email = localStorage.getItem('email');
    if (!email) {
        console.warn('User is not logged in. Cannot fetch watched videos.');
        return;
    }

    const sanitizedEmail = sanitizeEmail(email);
    const watchedVideosRef = database.ref(`ViewedVideos/${sanitizedEmail}`);

    watchedVideosRef.once('value').then(async (snapshot) => {
        const watchedVideos = snapshot.val();
        if (watchedVideos) {
            for (const videoId in watchedVideos) {
                const videoData = watchedVideos[videoId];
                const videoDetails = await fetchVideoDetails(videoId); // Fetch additional details from YouTube API

                if (videoDetails) {
                    addHistoryVideo({
                        ...videoDetails,
                        videoId: videoId, // Ensure videoId is included
                        duration: videoData.duration || 'Unknown Duration', // Include duration if stored in Firebase
                    });
                }
            }
        } else {
            console.log('No watched videos found.');
        }
    }).catch(error => {
        console.error('Error fetching watched videos:', error);
    });
}

// Function to add a video card to the history
function addHistoryVideo(video) {
    const historyContainer = document.getElementById("history-videos-container");

    const videoCard = document.createElement("div");
    videoCard.classList.add("bg-secondary", "text-white", "p-3", "rounded", "d-flex", "align-items-start", "justify-content-between", "my-2", "w-75");
    videoCard.style.cursor = 'pointer'; // Add cursor pointer to indicate clickable

    videoCard.innerHTML = `
        <img src="${video.thumbnail || 'https://via.placeholder.com/150'}" alt="${video.videoId}" class="rounded me-3" style="width: 150px; height: auto;">
        <div class="flex-grow-1">
            <h5 class="mb-1">${video.title || 'Untitled Video'}</h5>
            <p class="mb-0 text-white-50">${video.description || 'No description available.'}</p>
        </div>
        <button class="btn btn-outline-light btn-sm ms-3" onclick="removeVideo(event, this)">
            <i class="bi bi-x"></i>
        </button>
    `;

    // Add click event listener to redirect to the video page
    videoCard.addEventListener('click', () => {
        window.location.href = `video.html?videoId=${video.videoId}`;
    });

    historyContainer.appendChild(videoCard);
}

// Function to remove a video from the history
function removeVideo(event, button) {
    event.stopPropagation(); // Stop event propagation to prevent playing the video
    const videoCard = button.closest('div');
    const videoId = videoCard.querySelector('img').getAttribute('alt'); // Assuming videoId is stored in the alt attribute of the image

    const email = localStorage.getItem('email');
    if (!email) {
        console.warn('User is not logged in. Cannot remove video.');
        return;
    }

    const sanitizedEmail = sanitizeEmail(email);
    const videoRef = database.ref(`ViewedVideos/${sanitizedEmail}/${videoId}`);

    videoRef.remove()
        .then(() => {
            console.log('Video removed from database successfully.');
            videoCard.remove();
        })
        .catch(error => {
            console.error('Error removing video from database:', error);
        });
}
