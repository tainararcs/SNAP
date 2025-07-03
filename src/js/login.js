// Lógica de criação de usuários.

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

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userFound = users.find(user => user.email === email && user.senha === senha);

    if (userFound) {
        localStorage.setItem('usuarioLogado', JSON.stringify(userFound));
        showMessageLogin("Login bem-sucedido!");
        window.location.href = "interests.html"; // Redireciona para a tela de seleção de interesses.
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

    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Verifica se o email já está cadastrado.
    const existente = users.find(user => user.email === email);
    if (existente) {
        showMessageRegister("Email já cadastrado.");
        return;
    }

    const newUser = new User(nome, email, senha);
    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users));

    showMessageRegister("Usuário cadastrado com sucesso!");
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