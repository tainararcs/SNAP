import { User } from './User.js';

document.addEventListener('DOMContentLoaded', () => {
    // Seletores dos botões de alternância entre login e cadastro.
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container-login');
    
    // Alterna entre login e cadastro (transição visual).
    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });

    // Remove a classe para exibir a interface de login.
    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });

    // Captura os formulários de login e cadastro.
    const loginForm = document.getElementById('login-form-login');
    const registerForm = document.getElementById('register-form-login');

    // Trata o envio do formulário de login.
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita o recarregamento da página.
        loginUser();
    });

    // Trata o envio do formulário de cadastro.
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio padrão.
        registerUser();
        registerForm.reset(); // Limpa os campos do formulário após cadastro.
    });
});

/**
 * Realiza o login do usuário com base no e-mail e senha informados.
 * Valida os dados com as informações armazenadas no localStorage.
 */
function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-password').value;

    // Acessa o localStorage e busca um valor com a chave "user" e converte para um objeto JavaScript.
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.email === email && user.senha === senha) {
        // Converte o objeto user para uma string JSON com JSON.stringify() e armazena no localStorage com a chave "LoggedUser".
        localStorage.setItem('LoggedUser', JSON.stringify(user));

        showAlert('Login bem-sucedido!', 'success');

        // Verifica se o usuário tem interesses. Caso não tenha, redireciona para a página de interesses.
        if (!user.interests || user.interests.length === 0) {
            setTimeout(() => window.location.href = "interests.html", 1000);
        } else {
            setTimeout(() => window.location.href = "feed.html", 1000);
        }
       
    } else {
        showAlert('Email ou senha incorretos.', 'danger');
    }
}

/**
 * Registra um novo usuário e armazena seus dados localmente.
 * Redireciona para a página de interesses após o cadastro.
 */
function registerUser() {
    const nome = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const senha = document.getElementById('register-password').value;

    const newUser = new User(0, nome, email, senha);
   
    // Armazena o objeto 'newUser' no localStorage como uma string JSON com a chave 'user'.
    localStorage.setItem('user', JSON.stringify(newUser));

    showAlert('Usuário cadastrado com sucesso!', 'success');
    setTimeout(() => window.location.href = "interests.html", 1000);
}

/**
 * Exibe uma mensagem de alerta global na interface.
 *
 * @param {string} message - Texto da mensagem.
 * @param {string} type - Tipo do alerta (success, danger, warning...).
 * @param {number} duration - Tempo de exibição em milissegundos.
 */
function showAlert(message, type = "success", duration = 3000) {
    const alertDiv = document.getElementById("global-alert");
    alertDiv.className = `alert alert-${type} text-center global-alert`;
    alertDiv.textContent = message;
    alertDiv.classList.remove("d-none");

    // Oculta o alerta após determinado tempo.
    setTimeout(() => {
        alertDiv.classList.add("d-none");
    }, duration);
}
