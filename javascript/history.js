// Sidebar toggle functionality
document.getElementById("menu-toggle").addEventListener("click", function () {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("hidden");
});

// Example of dynamically adding watched videos
const watchedVideos = [
    { title: "How to Learn JavaScript", description: "A beginner's guide to JavaScript programming.", thumbnail: "https://via.placeholder.com/150" },
    { title: "CSS Grid Tutorial", description: "Learn how to use CSS Grid to create responsive layouts.", thumbnail: "https://via.placeholder.com/150" },
    { title: "Web Development Basics", description: "An overview of web development and its key concepts.", thumbnail: "https://via.placeholder.com/150" },
    // Add more videos as needed
];

// Function to add a video card to the history
function addHistoryVideo(video) {
    const historyContainer = document.getElementById("history-videos-container");

    const videoCard = document.createElement("div");
    videoCard.classList.add("bg-secondary", "text-white", "p-3", "rounded", "d-flex", "align-items-start", "justify-content-between", "my-2", "w-75");
    
    videoCard.innerHTML = `
        <img src="${video.thumbnail}" alt="Video Thumbnail" class="rounded me-3" style="width: 150px; height: auto;">
        <div class="flex-grow-1">
            <h5 class="mb-1">${video.title}</h5>
            <p class="mb-0 text-white-50">${video.description}</p>
        </div>
        <button class="btn btn-outline-light btn-sm ms-3" onclick="removeVideo(this)">
            <i class="bi bi-x"></i>
        </button>
    `;

    historyContainer.appendChild(videoCard);
}

// Function to remove a video from the history
function removeVideo(button) {
    const videoCard = button.closest('div');
    videoCard.remove();
}

// Add videos to the history
watchedVideos.forEach(video => addHistoryVideo(video));
