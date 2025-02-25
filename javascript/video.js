const urlParams = new URLSearchParams(window.location.search);
const videoId = urlParams.get('videoId');
const videoTitle = document.getElementById('video-title');
const recommendedList = document.getElementById('recommended-list');
const commentsList = document.getElementById('comments-list');
const commentInput = document.getElementById('comment-input');
const commentSubmit = document.getElementById('comment-submit');
const likeButton = document.getElementById('like-button');
const dislikeButton = document.getElementById('dislike-button');
const shareButton = document.getElementById('share-button');
const saveButton = document.querySelector(".btn-outline-light i.bi-bookmark").parentElement;
const videoDescription = document.getElementById('video-description');
const moreButton = document.getElementById('more-button');
const lessButton = document.getElementById('less-button');

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

likeButton.addEventListener('click', () => updateLikeDislikeCount('like'));
dislikeButton.addEventListener('click', () => updateLikeDislikeCount('dislike'));

function fetchComments() {
    const commentsRef = database.ref(`Comments/${videoId}`);
    commentsRef.on('value', snapshot => {
        const comments = snapshot.val();
        commentsList.innerHTML = '';
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentUserId = localStorage.getItem('uid');
        if (comments) {
            const sortedComments = Object.entries(comments).sort(([idA], [idB]) => idB.localeCompare(idA));
            sortedComments.forEach(([commentId, commentData]) => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment';
                const date = new Date(commentData.timestamp);
                const formattedDate = date.toLocaleString();
                commentElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <strong>${commentData.username} <small class="text-muted">${formattedDate}</small></strong>
                        ${isLoggedIn && currentUserId === commentData.userId
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

function deleteComment(commentId) {
    if (!commentId) return;

    const modal = document.getElementById('custom-modal');
    const confirmButton = document.getElementById('confirm-delete');
    const cancelButton = document.getElementById('cancel-delete');

    // Show the modal
    modal.style.display = 'flex';

    // Confirm deletion
    confirmButton.onclick = () => {
        modal.style.display = 'none';
        database.ref(`Comments/${videoId}/${commentId}`).remove()
            .then(() => {
                fetchComments();
            })
            .catch((error) => {
                console.error('Error deleting comment:', error);
                alert('Error deleting comment: ' + error.message);
            });
    };

    // Cancel deletion
    cancelButton.onclick = () => {
        modal.style.display = 'none';
    };
}

// Close the modal when clicking outside it
window.onclick = (event) => {
    const modal = document.getElementById('custom-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

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

function logVideoView(title) {
    const email = localStorage.getItem('email');
    if (!email) {
        console.warn('User is not logged in. Video view will not be logged.');
        return;
    }

    const sanitizedEmail = sanitizeEmail(email);
    const viewData = {
        videoId: videoId,
        title: title,
        timestamp: Date.now(),
    };

    database.ref(`ViewedVideos/${sanitizedEmail}/${videoId}`).set(viewData)
        .then(() => {
            console.log('Video view logged successfully.');
        })
        .catch(error => {
            console.error('Error logging video view:', error);
        });
}

function onPlayerReady(event) {
    event.target.playVideo();
    const videoData = event.target.getVideoData();
    const title = videoData.title || 'Untitled Video';
    document.title = title;
    videoTitle.innerText = title;
    updateLikeDislikeCountsDisplay();
    fetchComments();
    logVideoView(title); // Log the video view with the title when the player is ready

    // Fetch and display video description
    fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=AIzaSyBhMPZUpH_HE_otU_kOWd-Zra91EoayeP0`)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const description = data.items[0].snippet.description;
                videoDescription.innerText = description;
                if (description.split('\n').length > 3) {
                    moreButton.style.display = 'block';
                }
            } else {
                videoDescription.innerText = 'Description not available.';
            }
        })
        .catch(error => {
            console.error('Error fetching video description:', error);
            videoDescription.innerText = 'Error fetching description.';
        });
}

// Add event listener for the "More" button
moreButton.addEventListener('click', () => {
    videoDescription.style.webkitLineClamp = 'unset';
    videoDescription.style.maxHeight = 'none'; // Remove max-height for smooth transition
    moreButton.style.display = 'none';
    lessButton.style.display = 'block';
});

// Add event listener for the "Less" button
lessButton.addEventListener('click', () => {
    videoDescription.style.webkitLineClamp = '3';
    videoDescription.style.maxHeight = '4.5em'; // Set max-height for smooth transition
    moreButton.style.display = 'block';
    lessButton.style.display = 'none';
});

function onPlayerError(event) {
    console.error('Error with the YouTube Player:', event.data);
}

async function fetchRecommendedVideos() {
    if (!videoId) return;
    try {
        const response = fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=10&key=AIzaSyBjbMHVj0K6D31ikBF76rrlDpjWUkJmDM4`);
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

function sanitizeEmail(email) {
    return email.replace(/[.#$[\]]/g, ',');
}

function updateLikeDislikeCount(action) {
    const email = localStorage.getItem('email');
    if (!email) {
        alert('Please log in to perform this action.');
        return;
    }

    const sanitizedEmail = sanitizeEmail(email);
    console.log('Sanitized email:', sanitizedEmail);

    database.ref(`User/${sanitizedEmail}`).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                alert('Your account was not found. Please log in to perform this action.');
                return;
            }

            const videoLikesRef = database.ref(`LikeOrDislikeCount/${videoId}/${sanitizedEmail}`);
            videoLikesRef.once('value')
                .then(actionSnapshot => {
                    const currentAction = actionSnapshot.val();
                    console.log('Current action:', currentAction);

                    if (currentAction && currentAction.action === action) {
                        videoLikesRef.remove()
                            .then(() => {
                                updateLikeDislikeCountsDisplay();
                            })
                            .catch(error => {
                                console.error('Error removing like/dislike:', error);
                                alert('Error removing like/dislike: ' + error.message);
                            });
                    } else {
                        videoLikesRef.set({ action })
                            .then(() => {
                                updateLikeDislikeCountsDisplay();
                            })
                            .catch(error => {
                                console.error('Error updating like/dislike:', error);
                                alert('Error updating like/dislike: ' + error.message);
                            });
                    }
                })
                .catch(error => {
                    console.error('Error fetching current action:', error);
                    alert('Error fetching current action: ' + error.message);
                });
        })
        .catch(error => {
            console.error('Error checking email in database:', error);
            alert('Error checking email: ' + error.message);
        });
}

commentSubmit.addEventListener('click', () => {
    const email = localStorage.getItem('email');
    const commentText = commentInput.value.trim();

    if (!email) {
        alert('Please log in to leave a comment.');
        return;
    }

    if (!commentText) {
        alert('Comment cannot be empty.');
        return;
    }

    const sanitizedEmail = sanitizeEmail(email);

    database.ref(`User/${sanitizedEmail}`).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                alert('Your account was not found. Please log in to leave a comment.');
                return;
            }

            const userData = snapshot.val();
            const username = userData.Username || 'Unknown User';

            const commentId = database.ref(`Comments/${videoId}`).push().key;
            const newComment = {
                username: username,
                text: commentText,
                userId: userData.UID || '',
                timestamp: Date.now()
            };

            database.ref(`Comments/${videoId}/${commentId}`).set(newComment)
                .then(() => {
                    commentInput.value = '';
                    fetchComments();
                })
                .catch(error => {
                    console.error('Error adding comment:', error);
                    alert('Error adding comment: ' + error.message);
                });
        })
        .catch(error => {
            console.error('Error verifying user in database:', error);
            alert('Error verifying user: ' + error.message);
        });
});

shareButton.addEventListener('click', () => {
    const currentUrl = window.location.href;

    navigator.clipboard.writeText(currentUrl).then(() => {
        alert('The video URL has been copied to your clipboard.');
    }).catch((error) => {
        console.error('Failed to copy the URL: ', error);
        alert('Failed to copy the URL. Please try again.');
    });
});

saveButton.addEventListener("click", () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const uid = localStorage.getItem("uid");
    const email = localStorage.getItem("email");

    if (!isLoggedIn || !uid || !email) {
        alert("Please log in to perform this action.");
        return;
    }

    const sanitizedEmail = sanitizeEmail(email);

    database.ref(`User/${sanitizedEmail}`).once('value')
        .then(snapshot => {
            if (!snapshot.exists() || snapshot.val().Email !== email) {
                alert('Your account was not found or email does not match. Please log in to perform this action.');
                return;
            }

            const savedVideosRef = database.ref(`Saved Video/${sanitizedEmail}/${videoId}`);

            savedVideosRef.once("value").then(snapshot => {
                if (snapshot.exists()) {
                    savedVideosRef.remove()
                        .then(() => {
                            saveButton.innerHTML = `<i class="bi bi-bookmark"></i> Save`;
                            alert("Video removed from saved list.");
                        })
                        .catch(error => {
                            console.error("Error removing video: ", error);
                            alert("Failed to remove video. Please try again.");
                        });
                } else {
                    const videoData = {
                        videoId: videoId,
                        title: videoTitle.innerText || "Untitled Video",
                        timestamp: Date.now(),
                    };

                    savedVideosRef.set(videoData)
                        .then(() => {
                            saveButton.innerHTML = `<i class="bi bi-bookmark-fill"></i> Saved`;
                            alert("Video saved successfully.");
                        })
                        .catch(error => {
                            console.error("Error saving video: ", error);
                            alert("Failed to save video. Please try again.");
                        });
                }
            }).catch(error => {
                console.error("Error accessing saved video data: ", error);
                alert("An error occurred. Please try again.");
            });
        })
        .catch(error => {
            console.error('Error verifying user in database:', error);
            alert('Error verifying user: ' + error.message);
        });
});