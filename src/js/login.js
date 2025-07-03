let login_btn = document.querySelector('#login-page button[type="submit"]');
let register_btn = document.querySelector('#signup-page button[type="submit"]');

// Evento de clique para login.
login_btn.onclick = function(e) {
    e.preventDefault();
    login();
    document.querySelector('#email-login').value = '';
    document.querySelector('#password-login').value = '';
}

// Evento de clique para cadastro.
register_btn.onclick = function(e) {
    e.preventDefault();
    registerUser();
    document.querySelector('#email-signup').value = '';
    document.querySelector('#password-signup').value = '';
}

// Usuários do localStorage.
let storedUsers = JSON.parse(localStorage.getItem('usuarios')) || [];

// Função para login.
function login() {
    let email = document.querySelector('#email-login').value;
    let password = document.querySelector('#password-login').value;

    let user = searchUser(email);

    if (user) {
        if (user.password !== password) {
            showMessage('Senha incorreta.');
            return;
        }
        showMessage(`Bem-vindo, ${user.email}!`);
        window.location.href = 'feed.html';
    } else {
        showMessage('Usuário ou senha incorretos.');
    }
}

// Função para cadastro
function registerUser() {
    let name = document.querySelector('#nome').value;
    let email = document.querySelector('#email-signup').value;
    let password = document.querySelector('#password-signup').value;
    let birthDate = document.querySelector('#birth-date').value;

    if (searchUser(email)) {
        showMessage('Usuário já cadastrado.');
        return;
    }

    let newUser = {
        name: name,
        email: email,
        password: password,
        birthDate: birthDate
    };

    storedUsers.push(newUser);
    localStorage.setItem('usuarios', JSON.stringify(storedUsers));
    showMessage('Usuário cadastrado com sucesso!');
    window.location.href = 'interests.html';
}

// Função para pesquisar usuário.
function searchUser(email) {
    return storedUsers.find(user => user.email === email) || null;
}

// Função para exibir mensagem.
function showMessage(message) {
    let divMessage = document.querySelector('.mensagem');
    if (!divMessage) {
        divMessage = document.createElement('div');
        divMessage.className = 'mensagem';
        document.body.appendChild(divMessage);
    }

    divMessage.innerHTML = `
        <div style="color: red; font-weight: bold; padding: 10px; border: 1px solid red; border-radius: 5px; margin-top: 10px;">
            ${message}
        </div>
    `;
}

function showLoginPage() {
    document.querySelector('#login-page').style.display = 'block';
    document.querySelector('#signup-page').style.display = 'none';
}

function showRegisterPage() {
    document.querySelector('#login-page').style.display = 'none';
    document.querySelector('#signup-page').style.display = 'block';
}
