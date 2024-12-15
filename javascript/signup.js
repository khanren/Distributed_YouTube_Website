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
  
function signUp() {
    var username = document.getElementById("username");
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    var confirmPassword = document.getElementById("confirmPassword");
    
    if (password.value !== confirmPassword.value) {
        alert("Passwords do not match!");
        return;
    }

    auth.createUserWithEmailAndPassword(email.value, password.value)
        .then(() => {
            alert("SignUp Successfully");
        })
        .catch((e) => alert(e.message));
}