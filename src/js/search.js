document.addEventListener('DOMContentLoaded', () => {

    const searchLink = document.getElementById("link-search");

    searchLink.addEventListener("click", (e) => {

        e.preventDefault();

        loadPage("search", "search.html", () => {

            const searchInput = document.getElementById("search-input");
            const resultsContainer = document.getElementById("search-results");

            searchInput.addEventListener("input", () => {
                const query = searchInput.value.trim();
                if (query.length > 0) {
                    resultsContainer.innerHTML = `<p>Buscando por: <strong>${query}</strong>...</p>`;
                } else {
                    resultsContainer.innerHTML = `<p class="loading">Digite algo para começar a pesquisar...</p>`;
                }
            });
        });

        showPage("page-search");
        setActiveLink("link-search");
    });
});