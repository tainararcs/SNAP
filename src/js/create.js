document.addEventListener("click", (event) => {
  const target = event.target;

  if (target.id === "link-create") {
    event.preventDefault();

    // Carrega conteúdo da aba "Criar" e mostra a modal
    loadPage("create", "create.html", () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user) {
        document.getElementById("modal-avatar").src = user.profileImage || "https://via.placeholder.com/40";
        document.getElementById("modal-username").textContent = user.name || "Usuário";

        document.getElementById("postModal").classList.remove("hidden");

        document.getElementById("closePostModal").addEventListener("click", () => {
          document.getElementById("postModal").classList.add("hidden");
        });

        document.getElementById("postSubmitBtn").addEventListener("click", () => {
          const content = document.getElementById("postContent").value;
          const hashtags = document.getElementById("postHashtags").value;
          const data = new Date().toLocaleDateString("pt-BR");

          if (content.trim()) {
            const newPost = {
              conteudo: content,
              hashtags,
              avatarUrl: user.profileImage,
              data
            };

            user.posts = user.posts || [];
            user.posts.unshift(newPost);
            localStorage.setItem("user", JSON.stringify(user));

            alert("Post criado com sucesso!");
            document.getElementById("postModal").classList.add("hidden");
            document.getElementById("postContent").value = "";
            document.getElementById("postHashtags").value = "";
          } else {
            alert("Escreva algo antes de postar.");
          }
        });
      }
    });

    setActiveLink("link-create");
    showPage("page-create");
  }
});
