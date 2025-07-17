import { updateUserTheme } from './User.js';
const configLink = document.querySelector("#link-configs");
configLink.addEventListener("click", (e) => {

    e.preventDefault();

    loadPage("configs", "settings.html", ()=>{
        console.log("Configurações");
    });

    showPage("page-configs");
    setActiveLink("link-configs");
});


document.addEventListener("click", (e) => {
    // Voltar para a página inicial (feed)
    if(e.target.id === 'backToFeed') {
        e.preventDefault();
        window.location.href = "feed.html";
    }
    
    // Mostrar tema
    if(e.target.id === 'changeTheme') {
        document.querySelector("#settingsDesktop").style.display = "none";
        document.querySelector("#theme-div").style.display = "block";
    }
    // Voltar do tema para configurações
    if(e.target.id === 'TbackToSettings') {
        document.querySelector("#settingsDesktop").style.display = "block";
        document.querySelector("#theme-div").style.display = "none";
    }
    //Mudando o tema
    if(e.target.id === 'light-theme'){
        document.body.classList.remove('dark-mode');
        updateUserTheme(false);
    }
    if(e.target.id === 'dark-theme'){
        document.body.classList.add('dark-mode');
        updateUserTheme(true);
    }

    // Mostrar ajuda
    if(e.target.id === 'help') {
        document.querySelector("#settingsDesktop").style.display = "none";
        document.querySelector("#help-div").style.display = "block";
    }
    // Voltar da ajuda para configurações
    if(e.target.id === 'HbackToSettings') {
        document.querySelector("#settingsDesktop").style.display = "block";
        document.querySelector("#help-div").style.display = "none";
    }
    
    // Mostrar idioma
    if(e.target.id === 'language') {
        document.querySelector("#settingsDesktop").style.display = "none";
        document.querySelector("#language-div").style.display = "block";
    }
    // Voltar do idioma para configurações
    if(e.target.id === 'LbackToSettings') {
        document.querySelector("#settingsDesktop").style.display = "block";
        document.querySelector("#language-div").style.display = "none";
    }

    // Logout
    if(e.target.id === 'logoutBtn') {
        e.preventDefault();
        window.location.href = "index.html";
    }
});