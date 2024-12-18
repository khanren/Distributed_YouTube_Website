// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCCoYF6WOiJF6aUDDf0bbAH5OjE64jr064",
    authDomain: "distributed-4f324.firebaseapp.com",
    projectId: "distributed-4f324",
    storageBucket: "distributed-4f324.firebasestorage.app",
    messagingSenderId: "1039372735541",
    appId: "1:1039372735541:web:0e7a763807cbf70891cd7c",
    measurementId: "G-TFQK6LP2GK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Handle Email/Password Login
function signIn(event) {
    event.preventDefault(); // Prevent default form submission
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Check if the user's email is verified
            if (userCredential.user.emailVerified) {
                alert("Login Successful!");
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("email", userCredential.user.email);
                window.location.href = "index.html"; // Redirect to homepage
            } else {
                alert("Please verify your email before logging in.");
                auth.signOut(); // Sign out the user to prevent access
            }
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
}

// Add form submission event listener
document.getElementById("login-form").addEventListener("submit", signIn);

// Handle Google OAuth Login
function handleCredentialResponse(response) {
    console.log("Google JWT ID token: " + response.credential);

    // Save Google sign-in info to localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", "GoogleUser");
    localStorage.setItem("avatar", "https://via.placeholder.com/32");

    // Simulate redirect
    alert("Google Sign-In Successful!");
    window.location.href = "index.html";
}

// Handle Password Reset
function resetPassword(event) {
    event.preventDefault();
    const email = document.getElementById("reset-email").value;

    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert("Password reset email sent. Check your inbox.");
            window.location.href = "login.html"; // Redirect to login page
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
}

// Add event listener for the reset password form
const resetPasswordForm = document.getElementById("reset-password-form");
if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", resetPassword);
}

// Firebase Auth State Listener (Optional for Debugging)
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("Active user: " + user.email);
    } else {
        console.log("No active user found.");
    }
});
