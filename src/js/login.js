// Lógica de criação e login de usuários.

import { User } from './User.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.querySelector('.login');
    const registerSection = document.querySelector('.register');

    // Inicialmente, mostra apenas a tela de login.
    loginSection.classList.remove('hidden');
    registerSection.classList.add('hidden');

    // Evento de clique para mostrar a tela de cadastro.
    document.querySelector('.login a[href="#"]').addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden');
        registerSection.classList.remove('hidden');
    });

    // Evento de clique para voltar ao login.
    document.querySelector('.go-login').addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });

    // Botões de login e cadastro.
    document.querySelector('.login-btn').addEventListener('click', (e) => {
        e.preventDefault();
        loginUser();
    });

    document.querySelector('.register-btn').addEventListener('click', (e) => {
        e.preventDefault();
        registerUser();

        // Limpa os campos após cadastro.
        document.getElementById('register-name').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
    });
});

// Função de login.
function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-password').value;

    // Acessa o localStorage e busca um valor com a chave "user" e converte para um objeto JavaScript.
    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.email === email && user.senha === senha) {
        // Converte o objeto user para uma string JSON com JSON.stringify() e armazena no localStorage com a chave "LoggedUser".
        localStorage.setItem('LoggedUser', JSON.stringify(user));

        showMessageLogin("Login bem-sucedido!");
        
        window.location.href = "posts.html"; // Redireciona para o feed.
    } 
    else {
        showMessageLogin("Email ou senha incorretos.");
    }
}

// Função de cadastro.
function registerUser() {
    const nome = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const senha = document.getElementById('register-password').value;

    const newUser = new User(0, nome, email, senha);
   
    // Armazena apenas UM usuário no localstorage (sobrescreve o anterior).
    localStorage.setItem('user', JSON.stringify(newUser));

    showMessageRegister("Usuário cadastrado com sucesso!");

    window.location.href = "interests.html"; // Redireciona para a tela de seleção de interesses.
}

// Exibe uma mensagem referente ao login.
function showMessageLogin(message) {
    let messageDiv = document.getElementById('login-message');

    let messageHTML = `
    <div class="mensagem">
        ${message} 
    </div> `;

    // Adiciona a mensagem ao container.
    messageDiv.innerHTML = messageHTML;
}

// Exibe uma mensagem referente ao registro.
function showMessageRegister(message) {
    let messageDiv = document.getElementById('register-message');

    let messageHTML = `
    <div class="mensagem">
        ${message} 
    </div> `;

    // Adiciona a mensagem ao container.
    messageDiv.innerHTML = messageHTML;
}
