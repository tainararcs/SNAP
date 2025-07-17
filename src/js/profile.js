import { getStoredUsers } from './posts.js';

document.addEventListener('abrir-perfil', (event) => {
    const nomeUsuario = event.detail.nomeUsuario;
    // Extrai o nome do usuário da URL.
    const params = new URLSearchParams(window.location.search);
    const userName = params.get("user");
    
    console.log(userName);

    loadPage("profile", "profile.html", () => {


        const nomeSpan = document.getElementById("user-name");
        const postListContainer = document.getElementById("user-posts");

        // Atualiza o nome no perfil.
        if (nomeSpan) {
            nomeSpan.textContent = nomeUsuario;
        }

        const users = getStoredUsers();
        const usuario = users.find(u => u.nome === nomeUsuario);

        if (!usuario) {
            postListContainer.innerHTML = `<p>Usuário não encontrado.</p>`;
            return;
        }

        if (usuario.posts.length === 0) {
            postListContainer.innerHTML = `<p class="loading">Este usuário ainda não possui posts.</p>`;
        } else {
            postListContainer.innerHTML = usuario.posts.map(post => {
                return `
                    <div class="post-card">
                        <div class="post-header">
                            <img src="${post.avatarUrl}" 
                                alt="${usuario.nome}" 
                                class="post-avatar" 
                                onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
                            <span class="post-username">${usuario.nome}</span>
                            <span class="post-time">${post.data}</span>
                        </div>
                        <p class="post-content">${post.conteudo}</p>
                        <p class="post-hashtags">${post.hashtags}</p>
                    </div>
                `;
            }).join('');
        }
    });

    showPage("page-profile");
    setActiveLink(""); 
});
