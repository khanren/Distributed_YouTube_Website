// Import and configure Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js";
import { getDatabase, ref as dbRef, set } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";

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

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const database = getDatabase(app);

// Function to sanitize email for Firebase path
function sanitizeEmail(email) {
  return email.replace(/[.#$[\]]/g, ",");
}

// Function to sanitize file name for Firebase path
function sanitizeFileName(fileName) {
  return fileName.replace(/[.#$[\]]/g, "_");
}

// Function to show progress overlay
function showProgressOverlay(message = "Processing your video...") {
  const overlay = document.createElement("div");
  overlay.id = "progress-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1000";

  const spinner = document.createElement("div");
  spinner.id = "spinner";
  spinner.style.width = "50px";
  spinner.style.height = "50px";
  spinner.style.border = "5px solid #ccc";
  spinner.style.borderTop = "5px solid #ff0000";
  spinner.style.borderRadius = "50%";
  spinner.style.animation = "spin 1s linear infinite";

  const messageElement = document.createElement("p");
  messageElement.id = "progress-message";
  messageElement.textContent = message;
  messageElement.style.color = "#fff";
  messageElement.style.marginTop = "15px";
  messageElement.style.fontSize = "16px";

  overlay.appendChild(spinner);
  overlay.appendChild(messageElement);

  document.body.appendChild(overlay);

  // Add spinner animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// Function to update the progress overlay to a checkmark
function showCompletionOverlay() {
  const spinner = document.getElementById("spinner");
  const messageElement = document.getElementById("progress-message");

  if (spinner) {
    spinner.style.width = "0";
    spinner.style.height = "0";
    spinner.style.border = "none";

    const checkmark = document.createElement("div");
    checkmark.innerHTML = "&#10003;"; // Checkmark character
    checkmark.style.fontSize = "50px";
    checkmark.style.color = "#4CAF50";

    spinner.parentNode.replaceChild(checkmark, spinner);
  }

  if (messageElement) {
    messageElement.textContent = "Video uploaded successfully!";
    messageElement.style.color = "#4CAF50";
  }

  setTimeout(() => {
    hideProgressOverlay();
    window.location.href = "index.html"; // Redirect to index.html after 2 seconds
  }, 2000); // Hide overlay after 2 seconds
}

// Function to hide progress overlay
function hideProgressOverlay() {
  const overlay = document.getElementById("progress-overlay");
  if (overlay) {
    document.body.removeChild(overlay);
  }
}

// Function to preview the selected video
function previewVideo(file) {
  const videoPreview = document.getElementById("video-preview");
  const videoURL = URL.createObjectURL(file);
  videoPreview.src = videoURL;
  videoPreview.load();
  videoPreview.style.display = "block";
}

// Function to upload a video and save metadata
async function uploadVideo(file, email, title, description, tagsInput) {
  try {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    // Show progress overlay
    showProgressOverlay("Uploading your video...");

    // Sanitize the user's email and file name
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedFileName = sanitizeFileName(file.name);

    // Generate unique file name and storage path
    const videoId = `${Date.now()}_${sanitizedFileName}`;
    const videoPath = `videos/${videoId}`;

    // Create a storage reference
    const storageRefInstance = storageRef(storage, videoPath);

    // Upload the file to Firebase Storage
    const snapshot = await uploadBytes(storageRefInstance, file);
    console.log("File uploaded successfully:", snapshot.metadata);

    // Get the public download URL of the uploaded file
    const videoUrl = await getDownloadURL(storageRefInstance);
    console.log("Video URL:", videoUrl);

    // Get the upload time
    const uploadTime = new Date().toISOString();

    // Process tags input
    const tags = tagsInput ? tagsInput.split(",").map(tag => tag.trim()) : [];

    // Save metadata to Firebase Realtime Database
    const videoMetadataPath = `Uploaded Video/${sanitizedEmail}/${videoId}`;
    const metadata = {
      title: title || "Untitled",
      description: description || "No description provided.",
      uploadTime,
      url: videoUrl,
    };

    // Add tags to metadata if they exist
    if (tags.length > 0) {
      metadata.tags = tags;
    }

    await set(dbRef(database, videoMetadataPath), metadata);
    console.log("Metadata saved successfully:", metadata);

    // Update progress overlay to show completion
    showCompletionOverlay();

  } catch (error) {
    console.error("Error uploading video or saving metadata:", error);
    alert("Failed to upload video or save metadata. Please try again.");
    hideProgressOverlay();
  }
}

// Event listener for file input
document.getElementById("video-input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    previewVideo(file); // Show video preview
  }
});

// Event listener for the form submission
document.getElementById("upload-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = localStorage.getItem("email");

  if (!email) {
    alert("Please log in to upload a video.");
    return;
  }

  const title = document.getElementById("video-title").value;
  const description = document.getElementById("video-description").value;
  const tagsInput = document.getElementById("video-tags").value;

  const fileInput = document.getElementById("video-input");
  const file = fileInput.files[0];

  if (file) {
    await uploadVideo(file, email, title, description, tagsInput);
  } else {
    alert("Please select a video file before uploading.");
  }
});