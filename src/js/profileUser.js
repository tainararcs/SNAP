import { updateUserBios } from './User.js';

const profileUserLink = document.querySelector("#link-profile-user");

profileUserLink.addEventListener("click", (e) => {
    e.preventDefault();

    loadPage("profileUser", "profileUser.html", () => {
        setupBios();
        showPage("page-profile-user");
        setActiveLink("link-profile-user");
    });
});

function setupBios() {
    const biosAtual = document.getElementById("biosText");
    const biosBtn = document.querySelector(".biosBtn");
    
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};

    renderBios(user.bios);

    //Botão salvar
    biosBtn.addEventListener("click", () => {
        biosAtual.innerHTML = `
            <textarea id="editBiosTextarea" rows="4" style="width: 100%;">${user.bios || ""}</textarea>
            <button id="salvarBiosBtn">Salvar</button>
        `;
        document.getElementById("salvarBiosBtn").addEventListener("click", () => {
            const newBios = document.getElementById("editBiosTextarea").value;
            updateUserBios(newBios);
            renderBios(newBios);
        });
    });

    //Se a bios estiver vazia um template é apresentado.
    function generateEmptyBios() {
        biosAtual.innerHTML = `<p>Bios vazia, clique no botão "Editar Bios" para colocar um bios daora!</p>`;
    }

    //renderiza a bios do usuário logado
    function renderBios(biosText = "") {
        //verificando se a bios está vazia
        if (!biosText || !biosText.trim().length)
            generateEmptyBios();
        else
            //bios não vazia.
            biosAtual.innerHTML = `<p>${biosText}</p>`;
    }
}
