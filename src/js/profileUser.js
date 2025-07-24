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
  const cancelBtn = document.getElementById("cancelEditBtn");
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
      user.posts.forEach((post,index) => {
        const postHTML = `
          <div class="post-card">
            <div class="post-header">
              <img src="${user.profileImage}"
                alt="${user.name}"
                class="post-avatar"
                onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
              <span class="post-username">${user.name}</span>
              <span class="post-time">${post.data || ''}</span>
              <button class="delete-post-btn material-icons btn standard-btn delete-btn" title="Excluir post" data-index="${index}">
                  delete
              </button>
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
      // Evento para deletar post
      document.querySelectorAll(".delete-post-btn").forEach(button => {
        button.addEventListener("click", (e) => {
          const index = parseInt(e.target.dataset.index);
          if (!isNaN(index)) {
            if (confirm("Tem certeza que deseja excluir este post?")) {
              user.posts.splice(index, 1);
              localStorage.setItem("user", JSON.stringify(user));
              setupProfileUser(); // Re-renderiza os posts
            }
          }
        });
      });

    }
  }
  

  editBtn.addEventListener("click", () => {
    editBtn.style.display = "none"; 
    document.getElementById("cancelEditBtn").style.display = "inline-block"; 

    if (editIcon) editIcon.style.display = "block";
    if (saveBtn) saveBtn.style.display = "inline-block";
    if (nameDisplay) nameDisplay.style.display = "none";
    document.getElementById("name-edit-wrapper").style.display = "flex";

    if (bioText) bioText.style.display = "none";
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

    editBtn.style.display = "inline-block"; 
    document.getElementById("cancelEditBtn").style.display = "none"; 
  });

  cancelBtn.addEventListener("click", () => {
    const currentName = nameInput.value.trim();
    const currentBio = bioTextarea.value.trim();

    const originalName = user.name.trim();
    const originalBio = user.bio?.trim() || "";

    const houveAlteracao = currentName !== originalName || currentBio !== originalBio || tempImageFile;

    if (houveAlteracao) {
      const confirmExit = confirm("Você fez alterações. Deseja descartá-las?");
      if (!confirmExit) return;
    }

    // Reverter valores
    nameInput.value = originalName;
    bioTextarea.value = originalBio;

    // Restaurar interface
    if (editIcon) editIcon.style.display = "none";
    if (saveBtn) saveBtn.style.display = "none";
    if (editBtn) editBtn.style.display = "inline-block";
    cancelBtn.style.display = "none";

    if (nameDisplay) {
      nameDisplay.style.display = "block";
    }
    document.getElementById("name-edit-wrapper").style.display = "none";

    if (bioText) {
      bioText.style.display = "block";
    }
    document.getElementById("bio-edit-wrapper").style.display = "none";

    const postsContainer = document.getElementById("profileUser-posts");
    if (postsContainer) postsContainer.style.display = "block";

    // Reverter imagem de perfil temporária (recarrega a salva)
    if (tempImageFile) {
      loadUserProfileImage();
      tempImageFile = null;
    }
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