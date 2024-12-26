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
    var username = document.getElementById("username").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    auth.fetchSignInMethodsForEmail(email)
        .then((methods) => {
            if (methods.length > 0) {
                alert("This email is already registered. Please use a different email or log in.");
            } else {
                auth.createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        const uid = user.uid;
                        alert("Sign-up successful! A verification email has been sent to your mailbox. Please verify your email before logging in.");

                        user.sendEmailVerification()
                            .then(() => {
                                alert("Sign-up successful! A verification email has been sent to your mailbox. Please verify your email before logging in.");
                            })
                            .catch((error) => {
                                console.error("Error sending verification email:", error);
                                alert("Error sending verification email: " + error.message);
                            });

                        const sanitizedEmail = email.replace(/[.#$[\]]/g, ',');
                        database.ref('User/' + sanitizedEmail).set({
                            UID: uid,
                            Username: username,
                            Email: email
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
