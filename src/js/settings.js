const configLink = document.querySelector("#link-configs");
configLink.addEventListener("click", (e) => {

    e.preventDefault();

    loadPage("configs", "settings.html", ()=>{
        console.log("Configurações");
    });

    showPage("page-configs");
    setActiveLink("link-configs");
});