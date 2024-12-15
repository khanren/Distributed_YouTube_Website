document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const avatar = document.getElementById("avatar").value;

        if (username && avatar) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username);
            localStorage.setItem("avatar", avatar);

            window.location.href = "index.html";
        } else {
            alert("Please fill out all fields.");
        }
    });
});
