import { getStoredUsers } from './posts.js';
import { setupProfileUser } from './profileUser.js';
import { requisitarPost } from './gemini.js'; // Importação modificada

document.addEventListener("click", (event) => {
    if (event.target.classList.contains("clicavel")) {
        const userName = event.target.dataset.user;
        const currentUser = JSON.parse(localStorage.getItem("user"));
        const currentUserName = currentUser ? (currentUser.name || currentUser.nome) : null;

        if (userName === currentUserName) {
            loadPage("profileUser", "profileUser.html", () => {
                setupProfileUser();
            });
            setActiveLink("link-profile-user");  
            showPage("page-profile-user");       
        } else {
            loadPage("profile", "profile.html", () => {
                const users = getStoredUsers();
                const usuario = users.find(u => u.nome === userName);
                setupBioFicticia(usuario);
                
                const nomeSpan = document.getElementById("user-name");
                const postListContainer = document.getElementById("user-posts");
                const profileImage = document.getElementById("profile-img");

                nomeSpan.textContent = "";
                postListContainer.innerHTML = "";
                profileImage.src = "https://via.placeholder.com/80";

                if (nomeSpan) nomeSpan.textContent = userName;

                if (!usuario) {
                    postListContainer.innerHTML = `<p>Usuário não encontrado.</p>`;
                    return;
                }

                if (profileImage) {
                    profileImage.src = usuario.avatarUrl || 
                        (usuario.posts.length > 0 ? usuario.posts[0].avatarUrl : 'https://via.placeholder.com/80');
                }

                if (usuario.posts.length === 0) {
                    postListContainer.innerHTML = `<p class="loading">Este usuário ainda não possui posts.</p>`;
                } else {
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
    }
});

function setupBioFicticia(usuario = {}) {
    const bioContainer = document.getElementById("user-bio");
    const loadingElement = document.getElementById("bio-loading");
    const bioContent = document.getElementById("bio-content");
    const loadingMessage = document.getElementById("loading-message");

    if (!bioContainer || !loadingElement || !bioContent || !loadingMessage || !usuario || typeof usuario !== "object") return;

    // Se já temos uma bio válida, exibe diretamente
    if (usuario.bio && usuario.bio.trim().length > 0) {
        loadingElement.style.display = "none";
        bioContent.innerHTML = `<p class="bio-gene">${usuario.bio}</p>`;
        bioContent.style.display = "block";
        return;
    }

    // Configuração de retentativas
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 3000; // 3 segundos
    let retryCount = 0;
    let retryTimer = null;

    // Mostra o loading
    loadingElement.style.display = "flex";
    bioContent.style.display = "none";
    loadingMessage.textContent = "Carregando a bio...";
    retryCount = 0;

    function attemptGeneration() {
         requisitarPost(usuario.interests || [], true, usuario.nome || "")
            .then(([bioGerada]) => {
                if (bioGerada) {
                    // Atualiza o usuário no localStorage
                    const users = getStoredUsers();
                    const userIndex = users.findIndex(u => u.id === usuario.id);
                    
                    if (userIndex !== -1) {
                        users[userIndex].bio = bioGerada;
                        localStorage.setItem('usuarios', JSON.stringify(users));
                    }

                    bioContent.innerHTML = `<p class="bio-gene">${bioGerada}</p>`;
                    loadingElement.style.display = "none";
                    bioContent.style.display = "block";
                } else {
                    throw new Error("API retornou bio vazia");
                }
            })
            .catch(err => {
                console.error("Erro na geração de bio:", err);
                retryCount++;
                
                if (retryCount < MAX_RETRIES) {
                    loadingMessage.textContent = `Tentando novamente (${retryCount}/${MAX_RETRIES})...`;
                    retryTimer = setTimeout(attemptGeneration, RETRY_DELAY);
                } else {
                    bioContent.innerHTML = `<p>Não foi possível gerar a bio. Tente novamente mais tarde.</p>`;
                    loadingElement.style.display = "none";
                    bioContent.style.display = "block";
                }
            });
    }

    attemptGeneration();
}