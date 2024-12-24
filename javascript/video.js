const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('videoId');
const videoTitle = document.getElementById('video-title');
const recommendedList = document.getElementById('recommended-list');
const commentsList = document.getElementById('comments-list');
const commentInput = document.getElementById('comment-input');
const commentSubmit = document.getElementById('comment-submit');
const likeButton = document.getElementById('like-button');
const dislikeButton = document.getElementById('dislike-button');

let player;

const firebaseConfig = {
    apiKey: "AIzaSyCCoYF6WOiJF6aUDDf0bbAH5OjE64jr064",
    authDomain: "distributed-4f324.firebaseapp.com",
    projectId: "distributed-4f324",
    storageBucket: "distributed-4f324.firebasestorage.app",
    messagingSenderId: "1039372735541",
    appId: "1:1039372735541:web:0e7a763807cbf70891cd7c",
    measurementId: "G-TFQK6LP2GK",
    databaseURL: "https://distributed-4f324-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', initializePage);
likeButton.addEventListener('click', () => handleLikeDislike('like'));
dislikeButton.addEventListener('click', () => handleLikeDislike('dislike'));
commentSubmit.addEventListener('click', addComment);

function initializePage() {
    if (!videoId) {
        videoTitle.innerText = 'Video not found!';
        return;
    }
    setupAuthStateListener();
    loadYouTubePlayer();
    fetchComments();
    fetchRecommendedVideos();
}

function setupAuthStateListener() {
    firebase.auth().onAuthStateChanged(user => {
        const isAuthenticated = Boolean(user);
        toggleInteractionButtons(isAuthenticated);
    });
}

function toggleInteractionButtons(enabled) {
    likeButton.disabled = !enabled;
    dislikeButton.disabled = !enabled;
    commentSubmit.disabled = !enabled;
    commentInput.disabled = !enabled;
}

async function handleLikeDislike(action) {
    try {
        const user = await checkAuth();
        const userId = user.uid;
        const userRef = database.ref(`User/${userId}`);
        const videoRef = database.ref(`LikeOrDislikeCount/${videoId}/${userId}`);

        const userData = (await userRef.once('value')).val();
        const username = userData?.Username;

        if (!username) throw new Error('Unable to retrieve username.');

        const existingData = (await videoRef.once('value')).val();

        if (existingData?.action === action) {
            await videoRef.remove();
        } else {
            await videoRef.set({ username, action });
        }

        updateLikeDislikeCountsDisplay();
    } catch (error) {
        console.error('Error handling like/dislike:', error);
    }
}

async function updateLikeDislikeCountsDisplay() {
    try {
        const videoLikesRef = database.ref(`LikeOrDislikeCount/${videoId}`);
        const data = (await videoLikesRef.once('value')).val() || {};

        const likeCount = Object.values(data).filter(entry => entry.action === 'like').length;
        const dislikeCount = Object.values(data).filter(entry => entry.action === 'dislike').length;

        likeButton.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Like (${likeCount})`;
        dislikeButton.innerHTML = `<i class="bi bi-hand-thumbs-down"></i> Dislike (${dislikeCount})`;
    } catch (error) {
        console.error('Error updating like/dislike counts:', error);
    }
}

function fetchComments() {
    const commentsRef = database.ref(`Comments/${videoId}`);
    commentsRef.on('value', snapshot => {
        const comments = snapshot.val();
        commentsList.innerHTML = '';
        if (comments) {
            Object.entries(comments).forEach(([id, comment]) => {
                addCommentToDOM(id, comment);
            });
        }
    });
}

function addCommentToDOM(commentId, { username, text, userId }) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <strong>${username}</strong>
            ${firebase.auth().currentUser?.uid === userId ? `<button class="btn btn-danger btn-sm delete-comment" data-id="${commentId}">Delete</button>` : ''}
        </div>
        <p>${text}</p>
    `;

    commentElement.querySelector('.delete-comment')?.addEventListener('click', () => deleteComment(commentId));
    commentsList.appendChild(commentElement);
}

async function addComment() {
    try {
        const user = await checkAuth();
        const userId = user.uid;
        const username = (await database.ref(`User/${userId}`).once('value')).val()?.Username;

        if (!username) throw new Error('Unable to retrieve username.');

        const text = commentInput.value.trim();
        if (!text) throw new Error('Comment cannot be empty.');

        await database.ref(`Comments/${videoId}`).push({ userId, username, text });
        commentInput.value = '';
    } catch (error) {
        console.error('Error adding comment:', error);
    }
}

async function deleteComment(commentId) {
    try {
        const user = await checkAuth();
        const commentRef = database.ref(`Comments/${videoId}/${commentId}`);
        const comment = (await commentRef.once('value')).val();

        if (comment?.userId !== user.uid) throw new Error('You can only delete your own comments.');

        await commentRef.remove();
    } catch (error) {
        console.error('Error deleting comment:', error);
    }
}

async function fetchRecommendedVideos() {
    try {
        if (!videoId) return;

        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=10&key=AIzaSyDKCdoJUDNN-SDhsKn1IbjKYfW3YLP4NIw`);
        const data = await response.json();

        data.items?.forEach(({ id: { videoId }, snippet }) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}" class="img-fluid">
                <div>
                    <h6>${snippet.title}</h6>
                    <p>${snippet.channelTitle}</p>
                </div>
            `;
            listItem.addEventListener('click', () => window.location.href = `video.html?videoId=${videoId}`);
            recommendedList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching recommended videos:', error);
    }
}

function checkAuth() {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(user => user ? resolve(user) : reject(new Error('User not logged in')));
    });
}

function loadYouTubePlayer() {
    if (videoId) {
        player = new YT.Player('player', {
            videoId,
            playerVars: { autoplay: 1, controls: 1, rel: 0, modestbranding: 1 },
            events: { 
                onReady: updateLikeDislikeCountsDisplay, 
                onError: (event) => {
                    console.error('YouTube Player error:', event.data);
                    videoTitle.innerText = 'Error loading video!';
                } 
            }
        });
    } else {
        videoTitle.innerText = 'Video not found!';
    }
}
