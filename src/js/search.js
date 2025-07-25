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
    const allPosts = [];
    
    const cleanQuery = query.startsWith('#') ? query.substring(1) : query;
    const queryLower = cleanQuery.toLowerCase();

    // Coletar todos os posts (de usuários fictícios e do usuário atual)
    users.forEach((user) => {
        if (user.posts && Array.isArray(user.posts)) {
            user.posts.forEach(post => {
                allPosts.push({
                    nomeUsuario: user.nome,
                    conteudo: post.conteudo,
                    hashtags: post.hashtags,
                    avatarUrl: post.avatarUrl,
                    data: post.data
                });
            });
        }
    });

    // Adicionar posts do usuário atual
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser && currentUser.posts && Array.isArray(currentUser.posts)) {
        currentUser.posts.forEach((post) => {
            allPosts.push({
                nomeUsuario: currentUser.name ?? currentUser.nome ?? "Você",
                conteudo: post.conteudo,
                hashtags: post.hashtags,
                avatarUrl: currentUser.profileImage ?? post.avatarUrl,
                data: post.data
            });
        });
    }

    // Filtrar posts que correspondam à pesquisa
    const results = allPosts.filter(post => {
        if (!post.conteudo) return false;

        const content = post.conteudo.toLowerCase();
        const hashtags = post.hashtags 
            ? post.hashtags.toLowerCase().replace(/#/g, '').split(/\s+/) 
            : [];
        const username = post.nomeUsuario.toLowerCase();

        // Verifica no conteúdo, hashtags OU nome do usuário
        return content.includes(queryLower) || 
               hashtags.some(tag => tag.includes(queryLower)) ||
               username.includes(queryLower);
    });

    // Exibir resultados
    resultsContainer.innerHTML = results.length === 0
        ? `<p class="loading">Nenhum post encontrado com <strong>${query}</strong>.</p>`
        : results.map(postData => `
            <div class="post-card">
                <div class="post-header">
                    <img src="${postData.avatarUrl}" 
                        alt="${postData.nomeUsuario}" 
                        class="post-avatar" 
                        onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
                    <a href="#" class="clicavel" data-user="${postData.nomeUsuario}">${postData.nomeUsuario}</a>
                    <span class="post-time">${postData.data}</span>
                </div>
                <p class="post-content">${postData.conteudo}</p>
                ${postData.hashtags ? `<p class="post-hashtags">${postData.hashtags.split(" ").map(tag => 
                    `<a href="#" class="hashtag-link" data-hashtag="${tag}">${tag}</a>`
                ).join(" ")}</p>` : ''}
            </div>
        `).join('');
}
      function validateAndSearch(query) {
        if (query.length === 0) {
          resultsContainer.innerHTML = `<p class="loading">Digite algo para começar a pesquisar...</p>`;
          return;
        }

        if (query.length < 2) {
          resultsContainer.innerHTML = `<p class="loading">Você digitou: <strong>"${query}"</strong> - digite pelo menos 2 caracteres para pesquisar</p>`;
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
          document.getElementById("search-input").value =tag;
          validateAndSearch(tag);
        }
      });
    });

    setActiveLink("link-search");
    showPage("page-search");
  });
});
