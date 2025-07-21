import { loadUserProfileImage } from './User.js';
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
        const hashtags = document.getElementById("postHashtags").value;


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
      }
    });
  }
}
