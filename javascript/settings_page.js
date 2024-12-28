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

// Mock saving functionality
document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();
  document.getElementById('successMessage').style.display = 'block';
  setTimeout(() => {
      document.getElementById('successMessage').style.display = 'none';
  }, 2000);
});

document.addEventListener('DOMContentLoaded', function() {
    const email = localStorage.getItem('email');
    if (email) {
        document.getElementById('email').value = email;
    }
});

document.addEventListener('DOMContentLoaded', function() {
  var storedName = localStorage.getItem('username');
  if (storedName) {
      document.getElementById('name').value = storedName;
  }
});