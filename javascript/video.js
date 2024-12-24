const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('videoId');
const videoTitle = document.getElementById('video-title');
const recommendedList = document.getElementById('recommended-list');
const commentsList = document.getElementById('comments-list');
const commentInput = document.getElementById('comment-input');
const commentSubmit = document.getElementById('comment-submit');

let player;

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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const likeButton = document.getElementById('like-button');
const dislikeButton = document.getElementById('dislike-button');

likeButton.addEventListener('click', () => updateLikeDislikeCount('like'));
dislikeButton.addEventListener('click', () => updateLikeDislikeCount('dislike'));

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        likeButton.disabled = false;
        dislikeButton.disabled = false;
        commentSubmit.disabled = false;
        commentInput.disabled = false;
    } else {
        likeButton.disabled = true;
        dislikeButton.disabled = true;
        commentSubmit.disabled = true;
        commentInput.disabled = true;
    }
});

function checkAuth() {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                resolve(user);
            } else {
                alert('You must log in to perform this action.');
                reject(new Error('User not logged in'));
            }
        });
    });
}

function fetchComments() {
    const commentsRef = database.ref(`Comments/${videoId}`);
    commentsRef.on('value', snapshot => {
        const comments = snapshot.val();
        commentsList.innerHTML = '';
        if (comments) {
            Object.entries(comments).forEach(([commentId, commentData]) => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <strong>${commentData.username}</strong>
                        ${firebase.auth().currentUser && firebase.auth().currentUser.uid === commentData.userId
                            ? `<button class="btn btn-danger btn-sm delete-comment" data-id="${commentId}">Delete</button>`
                            : ''}
                    </div>
                    <p>${commentData.text}</p>
                `;
                commentsList.appendChild(commentElement);
            });
            const deleteButtons = document.querySelectorAll('.delete-comment');
            deleteButtons.forEach(button => {
                button.addEventListener('click', () => deleteComment(button.dataset.id));
            });
        }
    });
}

commentSubmit.addEventListener('click', () => {
    checkAuth()
        .then(user => {
            const userId = user.uid;
            const userRef = database.ref(`User/${userId}`);
            userRef.once('value').then(snapshot => {
                const userData = snapshot.val();
                if (userData && userData.Username) {
                    const username = userData.Username;
                    const commentText = commentInput.value;
                    if (commentText.trim() === '') {
                        alert('Comment cannot be empty.');
                        return;
                    }
                    const commentRef = database.ref(`Comments/${videoId}`).push();
                    commentRef.set({ userId, username, text: commentText });
                    commentInput.value = '';
                } else {
                    alert('Unable to retrieve username. Please check your account.');
                }
            });
        })
        .catch(() => {});
});

function deleteComment(commentId) {
    checkAuth()
        .then(() => {
            const commentRef = database.ref(`Comments/${videoId}/${commentId}`);
            commentRef.once('value').then(snapshot => {
                const commentData = snapshot.val();
                if (commentData && commentData.userId === firebase.auth().currentUser.uid) {
                    commentRef.remove();
                } else {
                    alert('You can only delete your own comments.');
                }
            });
        })
        .catch(() => {});
}

function updateLikeDislikeCount(action) {
    checkAuth()
        .then(user => {
            const userId = user.uid;
            const userRef = database.ref(`User/${userId}`);
            const videoRef = database.ref(`LikeOrDislikeCount/${videoId}/${userId}`);
            userRef.once('value').then(snapshot => {
                const userData = snapshot.val();
                if (userData && userData.Username) {
                    const username = userData.Username;
                    videoRef.once('value').then(snapshot => {
                        const existingData = snapshot.val();
                        if (existingData && existingData.action === action) {
                            videoRef.remove().then(() => updateLikeDislikeCountsDisplay());
                        } else {
                            videoRef.set({ username, action }).then(() => updateLikeDislikeCountsDisplay());
                        }
                    });
                } else {
                    alert('Unable to retrieve username. Please check your account.');
                }
            });
        })
        .catch(() => {});
}

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
        likeButton.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Like (${likeCount})`;
        dislikeButton.innerHTML = `<i class="bi bi-hand-thumbs-down"></i> Dislike (${dislikeCount})`;
    });
}

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(error => {
    console.error('Auth persistence error: ', error);
});

function onYouTubeIframeAPIReady() {
    if (videoId) {
        player = new YT.Player('player', {
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                controls: 1,
                rel: 0,
                modestbranding: 1
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

function onPlayerReady(event) {
    event.target.playVideo();
    const videoData = event.target.getVideoData();
    const title = videoData.title || 'Untitled Video';
    document.title = title;
    videoTitle.innerText = title;
    updateLikeDislikeCountsDisplay();
    fetchComments();
}

function onPlayerError(event) {
    console.error('Error with the YouTube Player:', event.data);
}

async function fetchRecommendedVideos() {
    if (!videoId) return;
    try {
        const response = fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=10&key=AIzaSyBhMPZUpH_HE_otU_kOWd-Zra91EoayeP0`);
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

document.addEventListener('DOMContentLoaded', () => {
    fetchRecommendedVideos();
});

document.getElementById('share-button').addEventListener('click', () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
        .then(() => {
            alert('The link has been copied to your clipboard. Share it with others!');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy the link. Please try again.');
        });
});

const saveButton = document.querySelector(".btn-outline-light i.bi-bookmark").parentElement;

saveButton.addEventListener("click", () => {
    checkAuth()
        .then(user => {
            const userId = user.uid;
            const savedVideosRef = database.ref(`Saved Video/${userId}/${videoId}`);

            savedVideosRef.once('value').then(snapshot => {
                if (snapshot.exists()) {
                    savedVideosRef.remove()
                        .then(() => {
                            saveButton.innerHTML = `<i class="bi bi-bookmark"></i> Save`;
                        })
                        .catch(error => {
                            console.error("Error removing video: ", error);
                            alert("Failed to remove video. Please try again.");
                        });
                } else {
                    const videoData = {
                        videoId: videoId,
                        title: videoTitle.innerText || "Untitled Video"
                    };

                    savedVideosRef.set(videoData)
                        .then(() => {
                            saveButton.innerHTML = `<i class="bi bi-bookmark-fill"></i> Saved`;
                        })
                        .catch(error => {
                            console.error("Error saving video: ", error);
                            alert("Failed to save video. Please try again.");
                        });
                }
            });
        })
        .catch(() => {});
});

document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/"; 
});

Object.defineProperty(document, 'cookie', {
    set: function() {
        console.warn('Cookies are disabled');
    }
});