import { getStoredUsers } from "./posts.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchLink = document.getElementById("link-search");

  searchLink.addEventListener("click", (e) => {
    e.preventDefault();

    loadPage("search", "search.html", () => {
      const searchInput = document.getElementById("search-input");
      const resultsContainer = document.getElementById("search-results");

      function performSearch(query) {
        const users = getStoredUsers();
        const results = [];

        users.forEach((user) => {
          user.posts.forEach((post) => {
            if (post.hashtags.includes(query)) {
              results.push({
                nomeUsuario: user.nome,
                conteudo: post.conteudo,
                hashtags: post.hashtags,
                avatarUrl: post.avatarUrl,
                data: post.data,
              });
            }
          });
        });

        resultsContainer.innerHTML =
          results.length === 0
            ? `<p class="loading">Nenhum post encontrado com a hashtag <strong>${query}</strong>.</p>`
            : results
                .map(
                  (postData) => `
              <div class="post-card">
                <div class="post-header">
                  <img src="${postData.avatarUrl}" 
                    alt="${postData.nomeUsuario}" 
                    class="post-avatar" 
                    onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
                  <a href="#" class="clicavel" data-user="${
                    postData.nomeUsuario
                  }">${postData.nomeUsuario}</a>
                  <span class="post-time">${postData.data}</span>
                </div>
                <p class="post-content">${postData.conteudo}</p>
                <p class="post-hashtags">${postData.hashtags
                  .split(" ")
                  .filter((tag) => tag.startsWith("#"))
                  .map(
                    (tag) =>
                      `<a href="#" class="hashtag-link" data-hashtag="${tag}">${tag}</a>`
                  )
                  .join(" ")}     
                </p>
              </div>
          `
                )
                .join("");
      }

      function validateAndSearch(query) {
        if (query.length === 0) {
          resultsContainer.innerHTML = `<p class="loading">Digite algo para começar a pesquisar...</p>`;
          return;
        }

        if (query.length < 2) {
          resultsContainer.innerHTML = `<p class="loading">Digite uma hashtag válida (ex: #Jogos)</p>`;
          return;
        }

        resultsContainer.innerHTML = `<p>Buscando por: <strong>${query}</strong>...</p>`;
        performSearch(query);
      }

      const storedQuery = localStorage.getItem("searchQuery");
      if (storedQuery) {
        searchInput.value = storedQuery;
        localStorage.removeItem("searchQuery");
        validateAndSearch(storedQuery);
      }

      searchInput.addEventListener("input", () => {
        validateAndSearch(searchInput.value.trim());
      });
      resultsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("hashtag-link")) {
          e.preventDefault();
          const tag = e.target.dataset.hashtag;
          searchInput.value = tag;
          validateAndSearch(tag);
        }
      });
    });

    setActiveLink("link-search");
    showPage("page-search");
  });
});
