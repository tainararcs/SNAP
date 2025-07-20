import { updateUserBios, saveUserProfileImage, loadUserProfileImage } from './User.js';

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

function setupProfileUser() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;

  loadUserProfileImage();

  // Inputs e elementos...
  const nameDisplay = document.getElementById("profileUser-name");
  const nameInput = document.getElementById("name-edit-input");
  const biosText = document.getElementById("biosText");
  const biosTextarea = document.getElementById("bios-edit-textarea");
  const editIcon = document.querySelector("label.edit-icon-label");
  const editBtn = document.getElementById("editProfileBtn");
  const saveBtn = document.getElementById("saveProfileBtn");
  const biosBtn = document.querySelector(".biosBtn");
  const uploadInput = document.getElementById("profile-upload");

  if (nameDisplay && nameInput) {
    nameDisplay.textContent = `@${user.name}`;
    nameInput.value = user.name;
  }

  if (biosText && biosTextarea) {
    biosText.textContent = user.bios || "";
    biosTextarea.value = user.bios || "";
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
              <img src="${post.avatarUrl || user.profileImage || 'https://via.placeholder.com/40'}"
                alt="${user.name}"
                class="post-avatar"
                onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
              <span class="post-username">${user.name}</span>
              <span class="post-time">${post.data || ''}</span>
            </div>
            <p class="post-content">${post.conteudo}</p>
            <p class="post-hashtags">${post.hashtags || ''}</p>
          </div>
        `;
        postsContainer.insertAdjacentHTML("beforeend", postHTML);
      });
    }
  }


  editBtn.addEventListener("click", () => {
    if (editIcon) editIcon.style.display = "block";
    if (saveBtn) saveBtn.style.display = "inline-block";
    if (nameDisplay) nameDisplay.style.display = "none";
    if (nameInput) nameInput.style.display = "inline-block";
    if (biosText) biosText.style.display = "none";
    if (biosTextarea) biosTextarea.style.display = "block";
    if (biosBtn) biosBtn.style.display = "inline-block";

    const postsContainer = document.getElementById("profileUser-posts");
    if (postsContainer) postsContainer.style.display = "none";

  });

  saveBtn.addEventListener("click", () => {
    const updatedName = nameInput.value.trim();
    const updatedBios = biosTextarea.value.trim();
    
    user.name = updatedName;
    user.bios = updatedBios;

    localStorage.setItem("user", JSON.stringify(user));

    if (tempImageFile) {
      saveUserProfileImage(tempImageFile); // só salva se houver nova imagem
      tempImageFile = null; // limpa após salvar
    }

    if (nameDisplay) {
      nameDisplay.textContent = `@${updatedName}`;
      nameDisplay.style.display = "block";
    }
    if (nameInput) nameInput.style.display = "none";

    if (biosText) {
      biosText.textContent = updatedBios;
      biosText.style.display = "block";
    }
    if (biosTextarea) biosTextarea.style.display = "none";
    if (biosBtn) biosBtn.style.display = "none";
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