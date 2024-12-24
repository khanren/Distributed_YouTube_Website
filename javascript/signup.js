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

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

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

                        user.sendEmailVerification()
                            .then(() => {
                                alert("SignUp Successful! A verification email has been sent.");
                            })
                            .catch((error) => {
                                console.error("Error sending verification email:", error);
                                alert("Error sending verification email: " + error.message);
                            });

                        database.ref('User/' + uid).set({
                            UID: uid,
                            Username: username,
                            Email: email,
                            Password: password
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