document.addEventListener('DOMContentLoaded', () => {

    const searchLink = document.getElementById("link-search");
    const centralDiv = document.querySelector(".feed-central");

    searchLink.addEventListener("click", (e) => {

        e.preventDefault(); // Evita navegação padrão
        
        // Carrega o conteúdo de search.html
        fetch("search.html")
            .then(response => {
                if (!response.ok) throw new Error("Erro ao carregar a página de pesquisa.");
                return response.text();
            })
            .then(html => {
                centralDiv.innerHTML = html;

                // Aqui você pode adicionar lógica para a barra de pesquisa
                const searchInput = document.getElementById("search-input");
                const resultsContainer = document.getElementById("search-results");

                searchInput.addEventListener("input", () => {
                    const query = searchInput.value.trim();
                    if (query.length > 0) {
                        resultsContainer.innerHTML = `<p>Buscando por: <strong>${query}</strong>...</p>`;
                        // Aqui você futuramente pode fazer um fetch a um backend e mostrar os resultados
                    } else {
                        resultsContainer.innerHTML = `<p class="loading">Digite algo para começar a pesquisar...</p>`;
                    }
                });
            })
            .catch(err => {
                centralDiv.innerHTML = `<p style="color:red;">${err.message}</p>`;
            });
    });
});