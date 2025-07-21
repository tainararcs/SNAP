// Referência para conteúdo de cada página.
const pages = {
        feed: document.getElementById("page-feed"),
        search: document.getElementById("page-search"),
        configs: document.getElementById("page-configs"),
        notifications: document.getElementById("page-notifications"),
        create: document.getElementById("page-create"),
        profile: document.getElementById("page-profile"),
        profileUser: document.getElementById("page-profile-user")
};

/* Exibe apenas a página desejada.
    Altera o display da mesma para block, e das demais páginas possíveis para none.
*/
function showPage(pageId) {

    Object.values(pages).forEach(page => {
        page.style.display = (page.id === pageId) ? "block" : "none";
    });

    const sidebarDireita = document.querySelector('.fixed-sidebar-direita');
    if (pageId === "page-configs" || pageId === "page-notifications" || pageId === "page-profile" || pageId === "page-profile-user") {
        sidebarDireita.style.display = "none";
    } else {
        sidebarDireita.style.display = "block";
    }
}

/* Define um link como ativo alterando seu estilo.
    Altera a classe do link para que ele seja estilizado como link ativos (nav-link active).
    Os demais links serão estilizados como não ativos (nav-link).
*/
function setActiveLink(activeLinkId) {

    document.querySelectorAll("#all-links .nav-link").forEach(link => {
        
        if(link.id === activeLinkId){
            link.classList.add("active");
        }
        else{
            link.classList.remove("active");
        }
    }); 
}

/* Carrega dinamicamente o conteúdo de uma página via fetch, inserindo-o em sua respectiva div,
    mas apenas se essa página ainda não tiver sido carregada antes (mantendo o estado entre navegações).

    Exemplo de uso:

        loadPage("search", "search.html", () => {
            const input = document.getElementById("search-input");
            input.addEventListener("input", () => console.log("Pesquisando..."));
        });
*/
function loadPage(pageId, url, callback) {

    const pageDiv = pages[pageId];

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Erro ao carregar ${url}`);
            return response.text();
        })
        .then(html => {
            pageDiv.innerHTML = html;
            if(callback) 
                callback(); // Carrega o callback da página.
        })
        .catch(err => {
            pageDiv.innerHTML = `<p style="color:red;">${err.message}</p>`;
        });
}