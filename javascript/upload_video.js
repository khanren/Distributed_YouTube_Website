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

// Function to sanitize email for Firebase path (minimal sanitization to align with `User` format)
function sanitizeEmail(email) {
  return email.replace(/[.#$[\]]/g, ","); // Retain `@` and `.` for consistency with `User` node
}

// Function to sanitize file name for Firebase path
function sanitizeFileName(fileName) {
  return fileName.replace(/[.#$[\]]/g, "_");
}

// Function to preview the video
function previewVideo(file) {
  const videoPreview = document.getElementById("video-preview");
  if (file) {
    const fileURL = URL.createObjectURL(file);
    videoPreview.src = fileURL;
    videoPreview.style.display = "block"; // Show the video preview
  } else {
    videoPreview.src = "";
    videoPreview.style.display = "none"; // Hide the preview if no file is selected
  }
}

// Function to upload a video and save metadata
async function uploadVideo(file, email, title, description, tag) {
  try {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    // Sanitize the user's email and file name
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedFileName = sanitizeFileName(file.name);

    // Generate unique file name and storage path
    const videoId = `${Date.now()}_${sanitizedFileName}`;
    const videoPath = `videos/${videoId}`; // Matches the existing Firebase rules

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

    // Save metadata to Firebase Realtime Database
    const videoMetadataPath = `Uploaded Video/${sanitizedEmail}/${videoId}`;
    const metadata = {
      title: title || "Untitled",
      description: description || "No description provided.",
      uploadTime,
      url: videoUrl,
    };

    // Add tag only if it exists
    if (tag) {
      metadata.tag = tag;
    }

    // Set metadata in the Realtime Database
    await set(dbRef(database, videoMetadataPath), metadata);
    console.log("Metadata saved successfully:", metadata);

    alert("Video uploaded and metadata saved successfully!");
  } catch (error) {
    console.error("Error uploading video or saving metadata:", error);
    alert("Failed to upload video or save metadata. Check console for details.");
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

  // Retrieve user email from local storage
  const email = localStorage.getItem("email");

  if (!email) {
    alert("Please log in to upload a video.");
    return;
  }

  // Retrieve metadata from form safely
  const titleElement = document.getElementById("video-title");
  const descriptionElement = document.getElementById("video-description");
  const tagElement = document.getElementById("video-tag");

  const title = titleElement ? titleElement.value : null;
  const description = descriptionElement ? descriptionElement.value : null;
  const tag = tagElement ? tagElement.value : null;

  // Proceed with video upload
  const fileInput = document.getElementById("video-input");
  const file = fileInput.files[0];
  if (file) {
    await uploadVideo(file, email, title, description, tag); // Upload video to Firebase
  } else {
    alert("Please select a video file before uploading.");
  }
});
