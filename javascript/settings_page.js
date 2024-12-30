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

function previewProfilePicture(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          document.getElementById('profilePreview').src = e.target.result;
      };
      reader.readAsDataURL(file);
  }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    const email = localStorage.getItem('email');
    if (email) {
        document.getElementById('email').value = email;
    }
});

document.addEventListener('DOMContentLoaded', function() {
  const storedName = localStorage.getItem('username');
  if (storedName) {
      document.getElementById('name').value = storedName;
  }
});

// Add event listener to email input for validation
const emailInput = document.getElementById("email");
if (emailInput) {
    emailInput.addEventListener("input", function() {
        if (isValidEmail(emailInput.value)) {
            emailInput.classList.add("valid");
            emailInput.classList.remove("invalid");
            emailInput.style.boxShadow = "0 0 5px #00ff00"; // Green shadow
        } else {
            emailInput.classList.add("invalid");
            emailInput.classList.remove("valid");
            emailInput.style.boxShadow = ""; // Remove shadow
        }
    });
}

// Add event listener to name input for validation
const nameInput = document.getElementById("name");
if (nameInput) {
    nameInput.addEventListener("input", function() {
        if (nameInput.value.trim() !== "") {
            nameInput.classList.add("valid");
            nameInput.classList.remove("invalid");
            nameInput.style.boxShadow = "0 0 5px #00ff00"; // Green shadow
        } else {
            nameInput.classList.add("invalid");
            nameInput.classList.remove("valid");
            nameInput.style.boxShadow = "0 0 5px #ff0000"; // Red shadow
        }
    });
}

// Password strength validation function
function isStrongPassword(password) {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
}

// Add event listener to email input for validation
const current_password = document.getElementById("email");
if (current_password) {
    current_password.addEventListener("input", function() {
        if (isValidEmail(current_password.value)) {
            current_password.classList.add("valid");
            current_password.classList.remove("invalid");
            current_password.style.boxShadow = "0 0 5px #00ff00"; // Green shadow
        } else {
            current_password.classList.add("invalid");
            current_password.classList.remove("valid");
            current_password.style.boxShadow = ""; // Remove shadow
        }
    });
}

// Add event listener to current password input for validation
const currentPasswordInput = document.getElementById("current_password");
if (currentPasswordInput) {
    currentPasswordInput.addEventListener("input", function() {
        if (isStrongPassword(currentPasswordInput.value)) {
            currentPasswordInput.classList.add("valid");
            currentPasswordInput.classList.remove("invalid");
            currentPasswordInput.style.boxShadow = "0 0 5px #00ff00"; // Green shadow
        } else {
            currentPasswordInput.classList.add("invalid");
            currentPasswordInput.classList.remove("valid");
            currentPasswordInput.style.boxShadow = ""; // Remove shadow
        }
    });
}

// Add event listener to new password input for validation
const newPasswordInput = document.getElementById("new_password");
if (newPasswordInput) {
    newPasswordInput.addEventListener("input", function() {
        if (isStrongPassword(newPasswordInput.value)) {
            newPasswordInput.classList.add("valid");
            newPasswordInput.classList.remove("invalid");
            newPasswordInput.style.boxShadow = "0 0 5px #00ff00"; // Green shadow
        } else {
            newPasswordInput.classList.add("invalid");
            newPasswordInput.classList.remove("valid");
            newPasswordInput.style.boxShadow = ""; // Remove shadow
        }
    });
}

// Function to encrypt password using SHA-256
async function encryptPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Function to decrypt password (assuming a simple base64 encoding for demonstration purposes)
function decryptPassword(encryptedPassword) {
    return atob(encryptedPassword);
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(`toggle${inputId.charAt(0).toUpperCase() + inputId.slice(1)}Icon`);
  
  // Toggle input type
  if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('bi-eye-slash');
      icon.classList.add('bi-eye');
  } else {
      input.type = 'password';
      icon.classList.remove('bi-eye');
      icon.classList.add('bi-eye-slash');
  }

  // Add rotation animation
  icon.style.transition = 'transform 0.3s ease';
  icon.style.transform = 'rotate(360deg)';

  // Reset the rotation after the animation
  setTimeout(() => {
      icon.style.transform = 'rotate(0deg)';
  }, 300); // Duration matches the transition
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#settings-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const user = firebase.auth().currentUser;

        if (!user) {
            console.error("User is not signed in.");
            alert("You must be signed in to update your password.");
            return;
        }

        const newName = document.getElementById('name').value.trim();
        const newEmail = document.getElementById('email').value.trim();
        const currentName = localStorage.getItem('username');
        const currentEmail = localStorage.getItem('email');
        const currentPassword = document.getElementById('current_password').value;
        const newPassword = document.getElementById('new_password').value;

        console.log('New Name:', newName);
        console.log('Current Name in localStorage:', currentName);
        console.log('New Email:', newEmail);
        console.log('Current Email in localStorage:', currentEmail);

        // Check if the user is trying to change the password
        if (currentPassword && newPassword) {
            try {
                // Directly update password in Firebase Authentication
                await user.updatePassword(newPassword);
                console.log('Password successfully updated in Firebase Auth.');

                // Update the password in Firebase Realtime Database
                const sanitizedEmail = user.email.replace(/[.#$[\]]/g, ',');
                firebase.database().ref('User/' + sanitizedEmail).update({
                    Password: await encryptPassword(newPassword) // Store securely if necessary
                });
                console.log('Password successfully updated in Firebase Realtime Database.');

                // Clear password fields
                document.getElementById('current_password').value = '';
                document.getElementById('new_password').value = '';

                alert('Password updated successfully!');
            } catch (error) {
                console.error('Error updating password:', error);
                alert('Error: ' + error.message);
            }
        } 

        // Firebase Authentication and Realtime Database Update
        if (user) {
            const updates = {};

            // Update Firebase Authentication Profile
            if (newName && newName !== currentName) {
                user.updateProfile({
                    displayName: newName
                })
                .then(() => {
                    console.log('Firebase username updated.');
                    updates['/Username'] = newName;
                    localStorage.setItem('username', newName);
                    console.log('Username successfully updated in localStorage.');

                    // Update Realtime Database Username
                    const sanitizedEmail = currentEmail.replace(/[.#$[\]]/g, ',');
                    firebase.database().ref('User/' + sanitizedEmail).update({
                        Username: newName
                    })
                    .then(() => {
                        console.log('Username updated in Firebase Realtime Database.');
                    })
                    .catch((error) => {
                        console.error('Error updating username in database:', error);
                    });
                })
                .catch((error) => {
                    console.error('Error updating Firebase username:', error);
                });
            }

            if (newEmail && newEmail !== currentEmail) {
                user.updateEmail(newEmail)
                .then(() => {
                    console.log('Firebase email updated.');
                    updates['/Email'] = newEmail;

                    // Send verification email
                    user.sendEmailVerification().then(() => {
                        console.log('Verification email sent.');
                        alert('A verification email has been sent to your new email address. Please verify it to complete the update.');

                        // Listen for email verification
                        const checkEmailVerified = setInterval(() => {
                            user.reload().then(() => {
                                if (user.emailVerified) {
                                    clearInterval(checkEmailVerified);

                                    // Ensure the database path is sanitized for the new email
                                    const sanitizedOldEmail = currentEmail.replace(/[.#$[\]]/g, ',');
                                    const sanitizedNewEmail = newEmail.replace(/[.#$[\]]/g, ',');

                                    // Update Realtime Database Email Path
                                    const userRef = firebase.database().ref('User/' + sanitizedOldEmail);
                                    userRef.once('value')
                                    .then((snapshot) => {
                                        const userData = snapshot.val();
                                        if (userData) {
                                            firebase.database().ref('User/' + sanitizedNewEmail).set({
                                                ...userData,
                                                Email: newEmail
                                            })
                                            .then(() => {
                                                console.log('Email updated in Firebase Realtime Database.');
                                                userRef.remove(); // Remove old data
                                                localStorage.setItem('email', newEmail);
                                                console.log('Email successfully updated in localStorage.');
                                            })
                                            .catch((error) => {
                                                console.error('Error updating email in database:', error);
                                            });
                                        }
                                    })
                                    .catch((error) => {
                                        console.error('Error retrieving user data:', error);
                                    });
                                }
                            });
                        }, 1000);
                    }).catch((error) => {
                        console.error('Error sending verification email:', error);
                        alert('Error sending verification email: ' + error.message);
                    });
                })
                .catch((error) => {
                    console.error('Error updating Firebase email:', error);
                    alert('Error updating email: ' + error.message);
                });
            }

            // Update success message
            document.getElementById('successMessage').style.display = 'block';
            setTimeout(() => {
                document.getElementById('successMessage').style.display = 'none';
            }, 2000);
        } else {
            console.error('No user is signed in.');
            alert('You must be signed in to update your profile.');
        }
    });
});
