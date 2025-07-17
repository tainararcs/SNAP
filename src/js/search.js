import { getStoredUsers } from './posts.js';

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

                if (!query.startsWith("#") || query.length < 2) {
                    resultsContainer.innerHTML = `<p class="loading">Digite uma hashtag válida (ex: #Jogos)</p>`;
                    return;
                }           

                const users = getStoredUsers();
                const results = [];

                users.forEach(user => {
                    user.posts.forEach(post => {
                        if (post.hashtags.includes(query)) {
                            results.push({
                                nomeUsuario: user.nome,
                                conteudo: post.conteudo,
                                hashtags: post.hashtags,
                                avatarUrl: post.avatarUrl,
                                data: post.data
                            });
                        }
                    });
                });

                if (results.length === 0) {
                    resultsContainer.innerHTML = `<p class="loading">Nenhum post encontrado com a hashtag <strong>${query}</strong>.</p>`;
                } else {
                    resultsContainer.innerHTML = results.map(postData => {
                        return `
                            <div class="post-card">
                                <div class="post-header">
                                    <img src="${postData.avatarUrl}" 
                                        alt="${postData.nomeUsuario}" 
                                        class="post-avatar" 
                                        onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
                                    <span class="post-username">${postData.nomeUsuario}</span>
                                    <span class="post-time">${postData.data}</span>
                                </div>
                                <p class="post-content">${postData.conteudo}</p>
                                <p class="post-hashtags">${postData.hashtags}</p>
                            </div>
                        `;
                    }).join('');
                }
            });
        });

        showPage("page-search");
        setActiveLink("link-search");
    });
});