import {setupProfileUser} from './profileUser.js';
import {showAlert} from './login.js';
import {sanitizeText} from './User.js';

const createBtn = document.querySelector("#link-create");

// Variável que guarda o ID do link ativo anterior ao abrir o modal de criação
let previousActiveLink = null;

createBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Salva o link ativo antes de clicar em "criar"
  const current = document.querySelector(".nav-link.active");
  if (current && current.id !== "link-create") {
    previousActiveLink = current.id;
  }

  const container = document.getElementById("modals-container");
  
  // Carrega o modal de criação de post apenas se ele ainda não estiver carregado
  if (!document.getElementById("postModal")) {
    fetch("create.html")
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;
        setupCreateModal();// Inicializa os eventos e lógica do modal
      });
  } else {
    document.getElementById("postModal").classList.remove("hidden");
  }

  // Atualiza o estado de link ativo
  setActiveLink("link-create");
});


// Função que inicializa toda a lógica do modal de criação de post
function setupCreateModal() {
  const modal = document.getElementById("postModal");
  const closeBtn = document.getElementById("closePostModal");

  // Mostrar modal
  modal.classList.remove("hidden");

  // Fechar modal ao clicar no X
  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    clearCreateModalFields();
    setActiveLink(previousActiveLink);
    updateMobileTitleByLinkId(previousActiveLink);
  });

  // fechar clicando fora do modal
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
      clearCreateModalFields();
      setActiveLink(previousActiveLink);
    }
  });

  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    document.getElementById("modal-avatar").src = user.profileImage;
    document.getElementById("modal-username").textContent = sanitizeText(user.name);

    document.getElementById("postModal").classList.remove("hidden");

    document.getElementById("closePostModal").addEventListener("click", () => {
      document.getElementById("postModal").classList.add("hidden");
    });

    const content = document.getElementById("postContent");
    const charCountElement = document.getElementById("create-char-count");

    // Sistema de contador de caracteres
    function updateCharCount() {
      if (!content || !charCountElement) return;
      
      const currentLength = content.value.length;
      charCountElement.textContent = `${currentLength}/280`;
      
      // Limpar mensagem anterior
      const warningSpan = charCountElement.querySelector('.char-limit-warning');
      if (warningSpan) warningSpan.remove();
      
      if (currentLength >= 280) {
        const warning = document.createElement('span');
        warning.textContent = '(Limite máximo atingido)';
        warning.className = 'char-limit-warning';
        charCountElement.appendChild(warning);
      }
    }

    // Escuta evento de digitação para contar caracteres e limitar
    content.addEventListener('input', () => {
      // Limitar a 280 caracteres
      if (content.value.length > 280) {
        content.value = content.value.substring(0, 280);
      }
      updateCharCount();
    });

    // Evento de envio do post
    const postBtn = document.getElementById("postSubmitBtn");
    postBtn.addEventListener("click", () => {
      const content = document.getElementById("postContent").value;
      const rawHashtags = document.getElementById("postHashtags").value.trim();

      const words = rawHashtags.split(" ").filter(word => word !== "");
      const hashtagRegex = /^#[A-Za-z][a-zA-Z0-9]*$/;
      const allHashtagsValid = words.every(word => hashtagRegex.test(word));

      // Verifica se as hashtags são válidas
      if (!allHashtagsValid && rawHashtags.length > 0) {
        showAlert("Hashtags devem começar com '#'(ex: #Filme #musica)",'danger', 5000);
        return;
      } 

      const hashtags = words.join(" ");

      if (content.trim()) {
        const newPost = {
          conteudo: sanitizeText(content),
          hashtags,
          avatarUrl: user.profileImage,
          data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
        };

        // Adiciona o novo post ao usuário e salva no localStorage
        user.posts = user.posts || [];
        user.posts.unshift(newPost);
        localStorage.setItem('user', JSON.stringify(user));

        showAlert("Post criado","success");
        
        modal.classList.add("hidden");
        
        clearCreateModalFields();
        setActiveLink(previousActiveLink);
      }else{
        showAlert("Digite algo para postar", "warning");
      }
      setupProfileUser();// Recarrega o perfil do usuário com o novo post
    });
  }

  // Garante que o modal feche ao navegar entre links
  if (!modal.dataset.navListenersSet) {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      if (link.id !== "link-create") {
        link.addEventListener("click", () => {
          if (!modal.classList.contains("hidden")) {
            modal.classList.add("hidden");
            setActiveLink(link.id);
            updateMobileTitleByLinkId(link.id);
          }
        });
      }
    });
    modal.dataset.navListenersSet = "true";// evita adicionar eventos duplicados
  }
}

// Atualiza o título na barra superior do mobile
function updateMobileTitleByLinkId(linkId) {
  const link = document.getElementById(linkId);
  if (!link) return;

  const newTitle = link.getAttribute("data-title");
  const mobileTitleWrapper = document.querySelector('.mobile-title');
  const mobileTitleText = mobileTitleWrapper.querySelector('span');
  const logo = document.querySelector('.mobile-logo');

  if (!newTitle || !mobileTitleText) return;

  // Animação
  logo.classList.remove('animate__animated', 'animate__fadeInLeft');
  void mobileTitleText.offsetWidth;
  logo.classList.add('animate__animated', 'animate__fadeInLeft');

  if (newTitle === "Configurações" && window.innerWidth < 768) {
    document.getElementById('link-configs').style.display = 'none';
    mobileTitleWrapper.style.display = 'flex';
    mobileTitleWrapper.style.justifyContent = 'center';
    mobileTitleWrapper.style.paddingLeft = '0px';
  } else {
    document.getElementById('link-configs').style.display = 'flex';
    mobileTitleWrapper.style.display = 'flex';
    mobileTitleWrapper.style.justifyContent = 'flex-start';
    mobileTitleWrapper.style.paddingLeft = '70px';
  }

  mobileTitleText.textContent = newTitle;
}

// Limpa os campos do modal de criação de post
function clearCreateModalFields() {
  document.getElementById("postContent").value = "";
  document.getElementById("postHashtags").value = "";
  const charCountElement = document.getElementById("create-char-count");
  if (charCountElement) charCountElement.textContent = "0/280";
}
