import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCCoYF6WOiJF6aUDDf0bbAH5OjE64jr064",
    authDomain: "distributed-4f324.firebaseapp.com",
    projectId: "distributed-4f324",
    storageBucket: "distributed-4f324.appspot.com",
    messagingSenderId: "1039372735541",
    appId: "1:1039372735541:web:0e7a763807cbf70891cd7c",
    measurementId: "G-TFQK6LP2GK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("reset-password-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("reset-email").value;

    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Please check your inbox.");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error sending password reset email:", error);
        alert("Failed to send reset email. Please try again.");
    }
});