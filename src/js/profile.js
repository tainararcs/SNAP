import { getStoredUsers } from './posts.js';

document.addEventListener("click", (event) => {

    if (event.target.classList.contains("clicavel")) {
        
        // Extrai o nome do usuário da URL.
        const userName = event.target.dataset.user;
        
        loadPage("profile", "profile.html", () => {

            const nomeSpan = document.getElementById("user-name");
            const postListContainer = document.getElementById("user-posts");
            const profileImage = document.getElementById("profile-img");

            //Limpa o nome
            nomeSpan.textContent = "";

            // Limpa posts
            postListContainer.innerHTML = "";

            // Limpa imagem (coloca placeholder ou remove src)
            profileImage.src = "https://via.placeholder.com/80";

            // Atualiza o nome no perfil.
            if (nomeSpan) {
                nomeSpan.textContent = userName;
            }

            const users = getStoredUsers();
            const usuario = users.find(u => u.nome === userName);

            if (!usuario) {
                postListContainer.innerHTML = `<p>Usuário não encontrado.</p>`;
                return;
            }
            if (profileImage) {
                profileImage.src = usuario.avatarUrl || (usuario.posts.length > 0 ? usuario.posts[0].avatarUrl : 'https://via.placeholder.com/80');
            }
            if (usuario.posts.length === 0) {
                postListContainer.innerHTML = `<p class="loading">Este usuário ainda não possui posts.</p>`;
            } else {
                // Limpa antes de adicionar.
                postListContainer.innerHTML = "";

                usuario.posts.forEach(post => {
                    const postHTML = `
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

                    postListContainer.insertAdjacentHTML("beforeend", postHTML);
                });
            }
        });

        setActiveLink("profile-link"); 
        showPage("page-profile");
    }
});
