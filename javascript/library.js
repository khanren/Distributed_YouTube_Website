// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCoYF6WOiJF6aUDDf0bbAH5OjE64jr064",
  authDomain: "distributed-4f324.firebaseapp.com",
  projectId: "distributed-4f324",
  storageBucket: "distributed-4f324.firebasestorage.app",
  messagingSenderId: "1039372735541",
  appId: "1:1039372735541:web:0e7a763807cbf70891cd7c",
  measurementId: "G-TFQK6LP2GK",
  databaseURL: "https://distributed-4f324-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getDatabase, ref as dbRef, get, set } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getStorage, ref as storageRef, deleteObject } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js"; // Add this line

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

// Function to sanitize email for Firebase path
function sanitizeEmail(email) {
  return email.replace(/[.#$[\]]/g, ",");
}

// Function to sanitize file name for Firebase path
function sanitizeFileName(fileName) {
  return fileName.replace(/[.#$[\]]/g, "_");
}

// Function to fetch and display videos
async function fetchAndDisplayVideos() {
  const email = localStorage.getItem("email");

  if (!email) {
    alert("Please log in to view your videos.");
    return;
  }

  const sanitizedEmail = sanitizeEmail(email);
  const videoMetadataPath = `Uploaded Video/${sanitizedEmail}`;

  try {
    const snapshot = await get(dbRef(database, videoMetadataPath));
    if (snapshot.exists()) {
      const videos = snapshot.val();
      displayVideos(videos);
    } else {
      console.log("No videos found.");
    }
  } catch (error) {
    console.error("Error fetching video metadata:", error);
  }
}

// Function to display videos
function displayVideos(videos) {
  const libraryContainer = document.getElementById("library-container");
  libraryContainer.innerHTML = ""; // Clear existing content

  for (const videoId in videos) {
    const video = videos[videoId];
    const videoCard = document.createElement("div");
    videoCard.classList.add("bg-secondary", "text-white", "p-3", "rounded", "d-flex", "align-items-start", "justify-content-between", "my-2", "w-75");
    videoCard.style.cursor = 'pointer'; // Add cursor pointer to indicate clickable

    videoCard.innerHTML = `
      <img src="${video.thumbnail || 'https://via.placeholder.com/150'}" alt="${video.videoId}" class="rounded me-3" style="width: 150px; height: auto;">
      <div class="flex-grow-1">
        <h5 class="mb-1">${video.title || 'Untitled Video'}</h5>
        <p class="mb-0 text-white-50">${video.description || 'No description available.'}</p>
      </div>
      <button class="btn btn-outline-light btn-sm ms-3 delete-button">
        <i class="bi bi-x"></i>
      </button>
    `;

    // Add click event listener to redirect to the video page
    videoCard.addEventListener('click', () => {
      window.location.href = `video.html?videoId=${video.videoId}`;
    });

    // Add click event listener to the delete button
    const deleteButton = videoCard.querySelector('.delete-button');
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Stop event propagation to prevent playing the video
      showDeleteConfirmation(event, videoId);
    });

    libraryContainer.appendChild(videoCard);
  }
}

// Function to show delete confirmation
function showDeleteConfirmation(event, videoId) {
  event.stopPropagation(); // Stop event propagation to prevent playing the video
  const customAlert = document.getElementById("custom-alert");
  customAlert.style.display = "flex";

  const confirmButton = document.getElementById("confirm-delete");
  const cancelButton = document.getElementById("cancel-delete");

  confirmButton.onclick = () => {
    deleteVideo(videoId);
    customAlert.style.display = "none";
  };

  cancelButton.onclick = () => {
    customAlert.style.display = "none";
  };
}

// Function to delete video
async function deleteVideo(videoId) {
  const email = localStorage.getItem("email");
  if (!email) {
    alert("Please log in to delete a video.");
    return;
  }

  const sanitizedEmail = sanitizeEmail(email);
  const videoMetadataPath = `Uploaded Video/${sanitizedEmail}/${videoId}`;

  try {
    // Fetch video metadata to get the complete file name and thumbnail path
    const snapshot = await get(dbRef(database, videoMetadataPath));
    if (!snapshot.exists()) {
      throw new Error("Video metadata not found.");
    }
    const videoMetadata = snapshot.val();
    const videoStoragePath = `videos/${videoMetadata.videoId}_${sanitizeFileName(videoMetadata.originalFileName)}`;
    const thumbnailStoragePath = `thumbnails/${videoId}_auto.jpg`;

    // Delete video metadata from Firebase Realtime Database
    await set(dbRef(database, videoMetadataPath), null);
    console.log("Video metadata deleted successfully.");

    // Delete video file from Firebase Storage
    const videoRef = storageRef(storage, videoStoragePath);
    await deleteObject(videoRef);
    console.log("Video file deleted successfully.");

    // Delete thumbnail file from Firebase Storage if it exists
    if (thumbnailStoragePath) {
      const thumbnailRef = storageRef(storage, thumbnailStoragePath);
      await deleteObject(thumbnailRef);
      console.log("Thumbnail file deleted successfully.");
    }

    // Redirect to library.html
    window.location.href = "library.html";
  } catch (error) {
    console.error("Error deleting video:", error);
    alert("Failed to delete video. Please try again.");
  }
}

// Call the function to fetch and display videos when the page loads
window.addEventListener("load", fetchAndDisplayVideos);

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("menu-toggle").addEventListener("click", function () {
        const sidebar = document.getElementById("sidebar");
        sidebar.classList.toggle("hidden");
    });
});