document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        // Mock user authentication (replace with real authentication logic)
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username && password) { // Simplistic check, replace with actual authentication
            // Save user login info to localStorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username);
            localStorage.setItem("avatar", "https://via.placeholder.com/32"); // Mock avatar URL

            // Redirect to homepage
            window.location.href = "homepage.html";
        } else {
            alert("Invalid login. Please try again.");
        }
    });
});
