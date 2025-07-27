const createBtn = document.querySelector("#link-create");
let previousActiveLink = null;

createBtn.addEventListener("click", (e) => {
  e.preventDefault();

  // Guarda qual era o link ativo antes de clicar em "criar"
  const current = document.querySelector(".nav-link.active");
  if (current && current.id !== "link-create") {
    previousActiveLink = current.id;
  }

  const container = document.getElementById("modals-container");

  // Só carrega se ainda não estiver carregado
  if (!document.getElementById("postModal")) {
    fetch("create.html")
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;
        setupCreateModal();
      });
  } else {
    document.getElementById("postModal").classList.remove("hidden");
  }

  setActiveLink("link-create");
});

function setupCreateModal() {
  const modal = document.getElementById("postModal");
  const closeBtn = document.getElementById("closePostModal");

  // Mostrar modal
  modal.classList.remove("hidden");

  // Fechar modal ao clicar no X
  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    setActiveLink(previousActiveLink);
    updateMobileTitleByLinkId(previousActiveLink);
  });



  // fechar clicando fora do modal
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
      setActiveLink(previousActiveLink);
    }
  });

  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {

    document.getElementById("modal-avatar").src = user.profileImage;
    document.getElementById("modal-username").textContent = user.name;

    document.getElementById("postModal").classList.remove("hidden");

    document.getElementById("closePostModal").addEventListener("click", () => {
      document.getElementById("postModal").classList.add("hidden");
    });


    // Postar
    const postBtn = document.getElementById("postSubmitBtn");
    postBtn.addEventListener("click", () => {
      const content = document.getElementById("postContent").value;
      const rawHashtags = document.getElementById("postHashtags").value.trim();
      const errorDiv = document.getElementById("hashtagError");

      const words = rawHashtags.split(" ").filter(word => word !== "");
      const hashtagRegex = /^#[A-Za-z][a-zA-Z0-9]*$/;
      const allHashtagsValid = words.every(word => hashtagRegex.test(word));



      // Se tiver algo escrito e for inválido
      if (!allHashtagsValid && rawHashtags.length > 0) {
        errorDiv.textContent = "Hashtags devem começar com '#'(ex: #Filme #musica)";
        errorDiv.style.display = "block";

        setTimeout(() => {
          errorDiv.style.display = "none";
        }, 3000);
        return;
      } else {
        // Oculta o erro se estiver tudo certo
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
      }

      const hashtags = words.join(" ");

      if (content.trim()) {
        const newPost = {
          conteudo: content,
          hashtags,
          avatarUrl: user.profileImage,
          data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
        };

        user.posts = user.posts || [];
        user.posts.unshift(newPost);
        localStorage.setItem('user', JSON.stringify(user));

        console.log("Postando:", content, hashtags);

        modal.classList.add("hidden");
        document.getElementById("postContent").value = "";
        document.getElementById("postHashtags").value = "";
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
      }
    });
  }

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
    modal.dataset.navListenersSet = "true";
  }

}


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
