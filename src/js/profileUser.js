import {saveUserProfileImage, loadUserProfileImage } from './User.js';
import {showAlert} from './login.js';

const profileUserLink = document.querySelector("#link-profile-user");

profileUserLink.addEventListener("click", (e) => {
    e.preventDefault();

    loadPage("profileUser", "profileUser.html", () => {
        setupProfileUser();
    });
    setActiveLink("link-profile-user");
    showPage("page-profile-user");
});

let tempImageFile = null;

export function sanitizeText(text) {
    const element = document.createElement('div');
    element.innerText = text;
    return element.innerHTML;
}

export function setupProfileUser() {
  let user = JSON.parse(localStorage.getItem('user'));
  if (!user) return;

  loadUserProfileImage();

  // Elementos DOM
  const nameDisplay = document.getElementById("profileUser-name");
  const nameInput = document.getElementById("name-edit-input");
  const bioText = document.getElementById("bioText");
  const bioTextarea = document.getElementById("bio-edit-textarea");
  const charCountElement = document.getElementById("bio-char-count");
  const editIcon = document.querySelector("label.edit-icon-label");
  const editBtn = document.getElementById("editProfileBtn");
  const saveBtn = document.getElementById("saveProfileBtn");
  const cancelBtn = document.getElementById("cancelEditBtn");
  const uploadInput = document.getElementById("profile-upload");

  // Configuração inicial
  if (nameDisplay && nameInput) {
    nameDisplay.innerHTML = sanitizeText(user.name || "");
    nameInput.value = user.name || " ";
  }

  if (bioText && bioTextarea) {
    bioText.innerHTML = sanitizeText(user.bio || "");
    bioTextarea.value = user.bio || "";
  }

  // Sistema de contador de caracteres
  function updateCharCount() {
    if (!bioTextarea || !charCountElement) return;
    
    const currentLength = bioTextarea.value.length;
    charCountElement.textContent = `${currentLength}/100`;
    
    // Limpar mensagem anterior
    const warningSpan = charCountElement.querySelector('.char-limit-warning');
    if (warningSpan) warningSpan.remove();
    
    if (currentLength >= 100) {
      const warning = document.createElement('span');
      warning.textContent = '(Máximo atingido)';
      warning.className = 'char-limit-warning';
      charCountElement.appendChild(warning);
    }
  }

  // Configurar eventos para o contador
  if (bioTextarea && charCountElement) {
    // Atualizar contador ao iniciar
    updateCharCount();
    
    // Atualizar enquanto digita
    bioTextarea.addEventListener('input', () => {
      // Limitar a 100 caracteres
      if (bioTextarea.value.length > 100) {
        bioTextarea.value = bioTextarea.value.substring(0, 100);
      }
      updateCharCount();
    });
  }

  // Renderização de posts
  const postsContainer = document.getElementById("profileUser-posts");
  if (postsContainer && Array.isArray(user.posts)) {
    postsContainer.innerHTML = "";

    if (user.posts.length === 0) {
      postsContainer.innerHTML = `<p class="loading">Você ainda não publicou nenhum post.</p>`;
    } else {
      user.posts.forEach((post,index) => {
        const safeContent = sanitizeText(post.conteudo);
        const safeHashtags = sanitizeText(post.hashtags);

        const postHTML = `
          <div class="post-card">
            <div class="post-header">
              <img src="${user.profileImage}"
                alt="${user.name}"
                class="post-avatar"
                onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
              <span class="post-username">${sanitizeText(user.name)}</span>
              <span class="post-time">${post.data || ''}</span>
              <button class="delete-post-btn material-icons btn standard-btn delete-btn" title="Excluir post" data-index="${index}">
                  delete
              </button>
            </div>
            <p class="post-content">${safeContent}</p>
            <p class="post-hashtags">
              ${transformarHashtagsEmLinks(safeHashtags)}
            </p>
          </div>
        `;
        postsContainer.insertAdjacentHTML("beforeend", postHTML);
      });

      // Eventos para hashtags e botões de deletar
      document.querySelectorAll(".hashtag-link").forEach(link => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const hashtag = e.target.dataset.hashtag;
          localStorage.setItem("searchQuery", hashtag);
          const searchLink = document.getElementById("link-search");
          if (searchLink) searchLink.click();
         
        });
      });
      
      document.querySelectorAll(".delete-post-btn").forEach(button => {
        button.addEventListener("click", (e) => {
          const index = parseInt(e.target.dataset.index);
          if (!isNaN(index)) {
            if (confirm("Tem certeza que deseja excluir este post?")) {
              user.posts.splice(index, 1);
              localStorage.setItem("user", JSON.stringify(user));
              setupProfileUser();
              showAlert("Post apagado", "danger");
            }
          }
        });
      });
    }
  }
  

  // Eventos dos botões de edição
  editBtn.addEventListener("click", () => {
    editBtn.style.display = "none"; 
    cancelBtn.style.display = "inline-block"; 

    if (editIcon) editIcon.style.display = "block";
    if (saveBtn) saveBtn.style.display = "inline-block";
    if (nameDisplay) nameDisplay.style.display = "none";
    document.getElementById("name-edit-wrapper").style.display = "flex";

    if (bioText) bioText.style.display = "none";
    document.getElementById("bio-edit-wrapper").style.display = "flex";

    const postsContainer = document.getElementById("profileUser-posts");
    if (postsContainer) postsContainer.style.display = "none";

    // Atualizar contador ao entrar no modo edição
    updateCharCount();
  });

  saveBtn.addEventListener("click", () => {
    const updatedName = nameInput.value.trim();
    const updatedBio = bioTextarea.value.trim();
    
    // Validar comprimento da bio
    if (updatedBio.length > 100) {
      alert("A bio não pode ter mais de 100 caracteres.");
      return;
    }

   user.name = sanitizeText(updatedName.trim());
    user.bio = updatedBio;

    localStorage.setItem("user", JSON.stringify(user));
    if (tempImageFile) {
      saveUserProfileImage(tempImageFile);
      tempImageFile = null;

      location.reload();
    }

    if (nameDisplay) {
      nameDisplay.innerHTML = sanitizeText(updatedName);
      nameDisplay.style.display = "block";
    }

    document.getElementById("name-edit-wrapper").style.display = "none";

    if (bioText) {
      bioText.innerHTML = sanitizeText(updatedBio);
      bioText.style.display = "block";
    }
    document.getElementById("bio-edit-wrapper").style.display = "none";
    saveBtn.style.display = "none";
    if (editIcon) editIcon.style.display = "none";
    if (postsContainer) postsContainer.style.display = "block";

    editBtn.style.display = "inline-block"; 
    cancelBtn.style.display = "none"; 
    localStorage.setItem("user", JSON.stringify(user));
    setupProfileUser();
    

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
    saveBtn.style.display = "none";
    editBtn.style.display = "inline-block";
    cancelBtn.style.display = "none";

    if (nameDisplay) nameDisplay.style.display = "block";
    document.getElementById("name-edit-wrapper").style.display = "none";

    if (bioText) bioText.style.display = "block";
    document.getElementById("bio-edit-wrapper").style.display = "none";

    const postsContainer = document.getElementById("profileUser-posts");
    if (postsContainer) postsContainer.style.display = "block";

    // Reverter imagem
    if (tempImageFile) {
      loadUserProfileImage();
      tempImageFile = null;
    }
  });

  uploadInput.addEventListener("change", () => {
    const file = uploadInput.files[0];
    const maxSizeMB = 2;

    if(file){
      if (!file.type.startsWith("image/")) {
        uploadInput.value = ""; // limpa o campo
        showAlert("Selecione um arquivo de imagem (JPG, PNG, etc).", 'danger');
        return;
      }

    // Verifica se o tamanho é menor que o limite
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        uploadInput.value = ""; // limpa o campo
        showAlert(`A imagem deve ter no máximo ${maxSizeMB} MB.`, 'danger');
        return;
      }

      tempImageFile = file;
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
  const tags = hashtagsString.trim().split(/\s+/);
  return tags.map(tag => {
    const safeTag = tag.replace(/[^a-zA-Z0-9#_]/g, '');
    const hashtag = safeTag.replace(/\s/g, '_');
    return `<a href="#" class="hashtag-link" data-hashtag="${hashtag}">${hashtag}</a>`;
  }).join(' ');
}
