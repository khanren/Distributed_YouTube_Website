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

// Firebase Services
const auth = firebase.auth();
const database = firebase.database(); // Ensure Firebase is initialized before accessing database

// Email format validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Sign-Up Function
function signUp() {
    // Retrieve form inputs
    var username = document.getElementById("username").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    // Validate email format
    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Validate password match
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Check if email is already registered
    auth.fetchSignInMethodsForEmail(email)
        .then((methods) => {
            if (methods.length > 0) {
                // Email already registered
                alert("This email is already registered. Please use a different email or log in.");
            } else {
                // Proceed with signup
                auth.createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        const uid = user.uid;

                        // Send email verification
                        user.sendEmailVerification()
                            .then(() => {
                                alert("SignUp Successful! A verification email has been sent.");
                            })
                            .catch((error) => {
                                console.error("Error sending verification email:", error);
                                alert("Error sending verification email: " + error.message);
                            });

                        // Save user data in Firebase Realtime Database
                        database.ref('User/' + uid).set({
                            UID: uid,
                            Username: username,
                            Email: email,
                            Password: password // Avoid storing plain text passwords in production
                        })
                        .then(() => {
                            console.log("User data saved successfully!");
                            window.location.href = "login.html";
                        })
                        .catch((error) => {
                            console.error("Error saving user data:", error);
                            alert("Error saving user data: " + error.message);
                        });
                    })
                    .catch((error) => {
                        console.error("Error during sign up:", error);
                        alert(error.message);
                    });
            }
        })
        .catch((error) => {
            console.error("Error checking email:", error);
            alert("Error checking email: " + error.message);
        });
}

const likeButton = document.querySelector('#like-button'); // Assign appropriate ID
const dislikeButton = document.querySelector('#dislike-button'); // Assign appropriate ID
const likeCount = document.querySelector('#like-count');
const dislikeCount = document.querySelector('#dislike-count');

async function fetchCounts(videoId) {
    const videoRef = ref(db, `videos/${videoId}`);
    const snapshot = await get(videoRef);

    if (snapshot.exists()) {
        const data = snapshot.val();
        likeCount.innerText = data.likes || 0;
        dislikeCount.innerText = data.dislikes || 0;
    } else {
        set(videoRef, { likes: 0, dislikes: 0 });
        likeCount.innerText = 0;
        dislikeCount.innerText = 0;
    }
}

async function updateCount(videoId, type) {
    const videoRef = ref(db, `videos/${videoId}`);
    const snapshot = await get(videoRef);

    if (snapshot.exists()) {
        const data = snapshot.val();
        const updatedData = {
            likes: type === "like" ? (data.likes || 0) + 1 : data.likes || 0,
            dislikes: type === "dislike" ? (data.dislikes || 0) + 1 : data.dislikes || 0,
        };

        await update(videoRef, updatedData);
        fetchCounts(videoId); // Refresh UI
    }
}

likeButton.addEventListener('click', () => updateCount(videoId, 'like'));
dislikeButton.addEventListener('click', () => updateCount(videoId, 'dislike'));

// Initialize counts on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchCounts(videoId);
});
