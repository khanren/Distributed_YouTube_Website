// Wires the navbar search box on pages whose own script doesn't handle it
// (library.html, history.html). Submitting redirects to the search results page.
(function () {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    if (form && input) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const q = input.value.trim();
            if (q) window.location.href = `search.html?query=${encodeURIComponent(q)}`;
        });
    }
})();
