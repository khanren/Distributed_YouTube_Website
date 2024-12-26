const signInBtn = document.getElementById("nameBtn");
const signUpBtn = document.getElementById("pfpBtn");
const fistForm = document.getElementById("pfp");
const secondForm = document.getElementById("name");
const container = document.querySelector(".container");

signInBtn.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

signUpBtn.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

fistForm.addEventListener("submit", (e) => e.preventDefault());
secondForm.addEventListener("submit", (e) => e.preventDefault());