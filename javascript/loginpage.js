var firebaseConfig = {
    apiKey: "AIzaSyCCoYF6WOiJF6aUDDf0bbAH5OjE64jr064",
    authDomain: "distributed-4f324.firebaseapp.com",
    projectId: "distributed-4f324",
    storageBucket: "distributed-4f324.firebasestorage.app",
    messagingSenderId: "1039372735541",
    appId: "1:1039372735541:web:0e7a763807cbf70891cd7c",
    measurementId: "G-TFQK6LP2GK"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function signIn(event) {
    event.preventDefault();
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            if (userCredential.user.emailVerified) {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("email", userCredential.user.email);
                localStorage.setItem("uid", userCredential.user.uid); 
                window.location.href = "index.html";
            } else {
                alert("Please verify your email before logging in.");
                auth.signOut();
            }
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
}

document.getElementById("login-form").addEventListener("submit", signIn);

function handleCredentialResponse(response) {
    console.log("Google JWT ID token: " + response.credential);

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", "GoogleUser");
    localStorage.setItem("avatar", "https://via.placeholder.com/32");
    window.location.href = "index.html";
}

function resetPassword(event) {
    event.preventDefault();
    const email = document.getElementById("reset-email").value;

    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert("Password reset email sent. Check your inbox.");
            window.location.href = "login.html";
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
}

const resetPasswordForm = document.getElementById("reset-password-form");
if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", resetPassword);
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("Active user: " + user.email);
    } else {
        console.log("No active user found.");
    }
});