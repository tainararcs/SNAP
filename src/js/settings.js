import { updateUserTheme } from './User.js';
import { setupProfileUser } from './profileUser.js';

const configLink = document.querySelector("#link-configs");
configLink.addEventListener("click", (e) => {

    e.preventDefault();

    loadPage("configs", "settings.html", ()=>{
        setupSettingsNavigation();
    });

    setActiveLink("link-configs");
    showPage("page-configs");
});


function setupSettingsNavigation() {
    const settingsSections = {
        settingsMain: document.getElementById("settings-container"),
        theme: document.getElementById("theme-div"),
        help: document.getElementById("help-div"),
        language: document.getElementById("language-div")
    };
   

    function showSettingsSection(sectionId) {
        Object.values(settingsSections).forEach(section => {
            section.style.display = (section.id === sectionId) ? "block" : "none";
        });
    }

    // Botões de navegação
    document.getElementById("profile-link").addEventListener("click", (e) => {
  e.preventDefault();

  loadPage("profileUser", "profileUser.html", () => {
    setupProfileUser();

    // Aguarda DOM da página injetada e insere o botão
    setTimeout(() => {
      const header = document.querySelector(".settings-header");
      if (header && !document.getElementById("PbackToSettings")) {
        const backButton = document.createElement("button");
        backButton.id = "PbackToSettings";
        backButton.className = "btn standard-btn settings-btn";
        backButton.innerHTML =
          '<span class="glyphicon glyphicon-chevron-left"></span> Voltar';

        // Insere o botão no início do header
        header.insertBefore(backButton, header.firstChild);

        backButton.addEventListener("click", () => {
          loadPage("configs", "settings.html", () => {
            setupSettingsNavigation();
          });
          setActiveLink("link-configs");
          showPage("page-configs");
        });
      }
    }, 100);
  });

  setActiveLink("link-profile-user");
  showPage("page-profile-user");
});


    document.getElementById("changeTheme-link").addEventListener("click", e => {
        e.preventDefault();
        showSettingsSection("theme-div");
    });

    document.getElementById("help-link").addEventListener("click", e => {
        e.preventDefault();
        showSettingsSection("help-div");
    });

    // Botões de voltar
    document.getElementById("TbackToSettings").addEventListener("click", () => {
        showSettingsSection("settings-container");
    });

    document.getElementById("HbackToSettings").addEventListener("click", () => {
        showSettingsSection("settings-container");
    });

    document.getElementById("LbackToSettings").addEventListener("click", () => {
        showSettingsSection("settings-container");
    });

    //Tema
     document.getElementById("light-theme").addEventListener("click", (e) => {
        document.body.classList.remove('dark-mode');
        updateUserTheme(false);
    });

    document.getElementById("dark-theme").addEventListener("click", (e) => {
        document.body.classList.add('dark-mode');
        updateUserTheme(true);
    });
    
    // Logout
    document.getElementById("btnLogout").addEventListener("click", (e) => {
        if (confirm('Tem certeza que deseja sair de sua conta?')) {
            e.preventDefault();
            window.location.href = "index.html";
        }
    });
  
}