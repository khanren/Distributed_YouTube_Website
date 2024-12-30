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
const auth = firebase.auth();
const database = firebase.database();

// Utility function to hash data using SHA-256
async function hashData(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Add event listener to email input for validation
const emailInput = document.getElementById("email");
if (emailInput) {
    emailInput.addEventListener("input", function() {
        if (validateEmail(emailInput.value)) {
            emailInput.classList.add("valid");
            emailInput.classList.remove("invalid");
        } else {
            emailInput.classList.add("invalid");
            emailInput.classList.remove("valid");
        }
    });
}

// Sign In Function
async function signIn(event) {
    event.preventDefault();

    // Get email and password values
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    // Authenticate the user
    auth.signInWithEmailAndPassword(email, password)
        .then(async (userCredential) => {
            if (userCredential.user.emailVerified) {
                // Sanitize email to use as key in the database
                const sanitizedEmail = email.replace(/[.#$[\]]/g, ',');

                // Retrieve user data (username and password) from the database
                database.ref('User/' + sanitizedEmail).once('value')
                    .then(async (snapshot) => {
                        const userData = snapshot.val();

                        if (userData && userData.Username && userData.Password) {
                            const username = userData.Username;
                            const savedPassword = await hashData(userData.Password); // Hash password before storing

                            // Save data to localStorage
                            localStorage.setItem("username", username);
                            localStorage.setItem("password", savedPassword); // Store hashed password
                            localStorage.setItem("isLoggedIn", "true");
                            localStorage.setItem("email", userCredential.user.email);
                            localStorage.setItem("uid", userCredential.user.uid);

                            // Redirect to index.html
                            window.location.href = "index.html";
                        } else {
                            throw new Error("User data is missing or incomplete.");
                        }
                    })
                    .catch((error) => {
                        console.error("Error retrieving user data:", error);
                        alert("Error retrieving user data: " + error.message);
                    });
            } else {
                alert("Please verify your email before logging in.");
                auth.signOut();
            }
        })
        .catch((error) => {
            console.error("Error during sign-in:", error);
            alert("Error: " + error.message);
        });
}

// Add event listener to login form
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", signIn);
}

// Google Sign-In Handler
function handleCredentialResponse(response) {
    console.log("Google JWT ID token:", response.credential);

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", "GoogleUser");
    localStorage.setItem("avatar", "https://via.placeholder.com/32");

    // Redirect to index.html
    window.location.href = "index.html";
}

// Reset Password Function
function resetPassword(event) {
    event.preventDefault();

    const email = document.getElementById("reset-email").value;

    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert("Password reset email sent. Check your inbox.");
            window.location.href = "login.html";
        })
        .catch((error) => {
            console.error("Error during password reset:", error);
            alert("Error: " + error.message);
        });
}

// Add event listener to reset password form
const resetPasswordForm = document.getElementById("reset-password-form");
if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", resetPassword);
}

// Monitor Authentication State
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("Active user:", user.email);
    } else {
        console.log("No active user found.");
    }
});