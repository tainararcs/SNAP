import { getStoredUsers } from './posts.js';

document.getElementById("link-profile-user").addEventListener("click", (e) => {
  e.preventDefault();

  loadPage("profileUser", "profileUser.html", () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Usuário não logado");
      return;
    }

    let userData;
    try {
    userData = JSON.parse(storedUser);
    } catch (e) {
    alert("Erro ao carregar usuário");
    return;
    }


    const nomeSpan = document.getElementById("profileUser-name");
    const postListContainer = document.getElementById("profileUser-posts");
    const profileImage = document.getElementById("profileUser-img");

    nomeSpan.textContent = "";
    postListContainer.innerHTML = "";
    profileImage.src = "https://via.placeholder.com/80";

    nomeSpan.textContent = userData.name;

    const users = getStoredUsers();
    const usuario = users.find(u => u.nome === userData.name);

    if (!usuario) {
      postListContainer.innerHTML = `<p>Usuário não encontrado.</p>`;
      return;
    }

    profileImage.src = usuario.avatarUrl || (usuario.posts.length > 0 ? usuario.posts[0].avatarUrl : 'https://via.placeholder.com/80');

    if (usuario.posts.length === 0) {
      postListContainer.innerHTML = `<p class="loading">Você ainda não possui posts.</p>`;
    } else {
      usuario.posts.forEach(post => {
        const postHTML = `
          <div class="post-card">
            <div class="post-header">
              <img src="${post.avatarUrl}" alt="${usuario.nome}" class="post-avatar" onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
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

  showPage("page-profile-user");
  setActiveLink("link-profile-user");
});
