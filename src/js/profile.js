import { getStoredUsers } from './posts.js';
import { requisitarBiosUsuarioF } from './gemini.js';
import { updateUserBios } from './User.js';
import { setupProfileUser } from './profileUser.js';

document.addEventListener("click", (event) => {

    if (event.target.classList.contains("clicavel")) {
        
        const userName = event.target.dataset.user;

        const currentUser = JSON.parse(localStorage.getItem("user"));
        const currentUserName = currentUser ? (currentUser.name || currentUser.nome) : null;

        if (userName === currentUserName) {
            // Se clicar no próprio usuário, abre o perfil pessoal (profileUser.html)
            loadPage("profileUser", "profileUser.html", () => {
                setupProfileUser();
            });
            setActiveLink("link-profile-user");  
            showPage("page-profile-user");       
        } else {
            loadPage("profile", "profile.html", () => {
                const users = getStoredUsers();
                const usuario = users.find(u => u.nome === userName);
                setupBiosFicticia(usuario);
                
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

function setupBiosFicticia(usuario = {}) {
    const biosUserAI = document.getElementById("user-bios");

    if (!biosUserAI || !usuario || typeof usuario !== "object") return;

    function generateEmptyBios() {
        const interesses = Array.isArray(usuario.interesses) ? usuario.interesses : [];
        const username = usuario.nome;
        requisitarBiosUsuarioF(interesses, username).then(bioGerada => {
            usuario.bios = bioGerada;
            biosUserAI.innerHTML = `<p>${bioGerada}</p>`;
        }).catch(err => {
            biosUserAI.innerHTML = `<p>Erro ao gerar bios com IA.</p>`;
            console.error("Erro na geração de bios:", err);
        });
    }

    function renderBios(biosText = "") {
        if (!biosText || !biosText.trim().length)
            generateEmptyBios();
        else
            biosUserAI.innerHTML = `<p>${biosText}</p>`;
    }

    renderBios(usuario.bios); // Chama o render corretamente
}
