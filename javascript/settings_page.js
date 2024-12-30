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

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#settings-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const newName = document.getElementById('name').value.trim();
        const newEmail = document.getElementById('email').value.trim();
        const currentName = localStorage.getItem('username');
        const currentEmail = localStorage.getItem('email');

        console.log('New Name:', newName);
        console.log('Current Name in localStorage:', currentName);
        console.log('New Email:', newEmail);
        console.log('Current Email in localStorage:', currentEmail);

        // Firebase Authentication and Realtime Database Update
        const user = firebase.auth().currentUser;
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
