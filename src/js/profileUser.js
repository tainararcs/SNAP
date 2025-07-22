import {saveUserProfileImage, loadUserProfileImage } from './User.js';

const profileUserLink = document.querySelector("#link-profile-user");

profileUserLink.addEventListener("click", (e) => {
    e.preventDefault();

    loadPage("profileUser", "profileUser.html", () => {
         setupProfileUser();
    });
    setActiveLink("link-profile-user");
    showPage("page-profile-user");
});

let tempImageFile = null; // variável global temporária

export function setupProfileUser() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;

  loadUserProfileImage();

  // Inputs e elementos...
  const nameDisplay = document.getElementById("profileUser-name");
  const nameInput = document.getElementById("name-edit-input");
  const bioText = document.getElementById("bioText");
  const bioTextarea = document.getElementById("bio-edit-textarea");
  const editIcon = document.querySelector("label.edit-icon-label");
  const editBtn = document.getElementById("editProfileBtn");
  const saveBtn = document.getElementById("saveProfileBtn");
  const uploadInput = document.getElementById("profile-upload");

  if (nameDisplay && nameInput) {
    nameDisplay.textContent = `${user.name}`;
    nameInput.value = user.name;
  }

  if (bioText && bioTextarea) {
    bioText.textContent = user.bio || "";
    bioTextarea.value = user.bio || "";
  }

  // Renderiza os posts do usuário logado
  const postsContainer = document.getElementById("profileUser-posts");
  if (postsContainer && Array.isArray(user.posts)) {
    postsContainer.innerHTML = ""; // limpa antes de renderizar
    if (user.posts.length === 0) {
      postsContainer.innerHTML = `<p class="loading">Você ainda não publicou nenhum post.</p>`;
    } else {
      user.posts.forEach(post => {
        const postHTML = `
          <div class="post-card">
            <div class="post-header">
              <img src="${user.profileImage}"
                alt="${user.name}"
                class="post-avatar"
                onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
              <span class="post-username">${user.name}</span>
              <span class="post-time">${post.data || ''}</span>
            </div>
            <p class="post-content">${post.conteudo}</p>
           <p class="post-hashtags">
              ${transformarHashtagsEmLinks(post.hashtags)}
          </p>
          </div>
        `;
        postsContainer.insertAdjacentHTML("beforeend", postHTML);
      });
      // Adiciona os eventos de clique para hashtags
      document.querySelectorAll(".hashtag-link").forEach(link => {
        link.addEventListener("click", (e) => {
          e.preventDefault();

          const hashtag = e.target.dataset.hashtag;
          localStorage.setItem("searchQuery", hashtag);

          const searchLink = document.getElementById("link-search");
          if (searchLink) searchLink.click();
        });
      });

    }
  }
  

  editBtn.addEventListener("click", () => {
    if (editIcon) editIcon.style.display = "block";
    if (saveBtn) saveBtn.style.display = "inline-block";
    if (nameDisplay) nameDisplay.style.display = "none";
    document.getElementById("name-edit-wrapper").style.display = "flex";

    if (biosText) biosText.style.display = "none";
    document.getElementById("bio-edit-wrapper").style.display = "flex";

    const postsContainer = document.getElementById("profileUser-posts");
    if (postsContainer) postsContainer.style.display = "none";

  });

  saveBtn.addEventListener("click", () => {
    const updatedName = nameInput.value.trim();
    const updatedBio = bioTextarea.value.trim();
    
    user.name = updatedName;
    user.bio = updatedBio;

    localStorage.setItem("user", JSON.stringify(user));

    if (tempImageFile) {
      saveUserProfileImage(tempImageFile); // só salva se houver nova imagem
      tempImageFile = null; // limpa após salvar
    }

    if (nameDisplay) {
      nameDisplay.textContent = `@${updatedName}`;
      nameDisplay.style.display = "block";
    }
    document.getElementById("name-edit-wrapper").style.display = "none";

    if (bioText) {
      bioText.textContent = updatedBio;
      bioText.style.display = "block";
    }
    document.getElementById("bio-edit-wrapper").style.display = "none";
    if (saveBtn) saveBtn.style.display = "none";
    if (editIcon) editIcon.style.display = "none";
    if (postsContainer) postsContainer.style.display = "block";
  });

  uploadInput.addEventListener("change", () => {
    const file = uploadInput.files[0];
    if (file) {
      tempImageFile = file;

      // Pré-visualiza a imagem sem salvar ainda
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.getElementById("profile-preview");
        if (img) img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

function transformarHashtagsEmLinks(hashtagsString) {
  if (!hashtagsString) return '';
  const tags = hashtagsString.trim().split(/\s+/); // separa por espaço
  return tags.map(tag => {
    const hashtag = tag.replace(/\s/g, '_');
    return `<a href="#" class="hashtag-link" data-hashtag="${hashtag}">${hashtag}</a>`;
  }).join(' ');
}