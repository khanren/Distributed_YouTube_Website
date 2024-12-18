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

// Email format validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function signUp() {
    var username = document.getElementById("username");
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    var confirmPassword = document.getElementById("confirmPassword");

    // Validate email format
    if (!isValidEmail(email.value)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Validate password match
    if (password.value !== confirmPassword.value) {
        alert("Passwords do not match!");
        return;
    }

    // Check if email is already registered
    auth.fetchSignInMethodsForEmail(email.value)
        .then((methods) => {
            if (methods.length > 0) {
                // Email already registered
                alert("This email is already registered. Please use a different email or log in.");
            } else {
                // Proceed with signup
                auth.createUserWithEmailAndPassword(email.value, password.value)
                    .then((userCredential) => {
                        // Send email verification
                        userCredential.user.sendEmailVerification()
                            .then(() => {
                                alert("SignUp Successful! A verification email has been sent.");
                                window.location.href = "login.html"; 
                            })
                            .catch((error) => {
                                console.error("Error sending verification email:", error);
                                alert("Error sending verification email: " + error.message);
                            });
                    })
                    .catch((e) => {
                        console.error("Error during sign up:", e);
                        alert(e.message);
                    });
            }
        })
        .catch((error) => {
            console.error("Error checking email:", error);
            alert("Error checking email: " + error.message);
        });
}