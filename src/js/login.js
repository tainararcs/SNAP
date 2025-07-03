import { User } from './User.js';

// Login.

function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userFound = users.find(user => user.email === email && user.senha === senha);

    if (userFound) {
        localStorage.setItem('usuarioLogado', JSON.stringify(userFound));
        alert("Login bem-sucedido!");
        window.location.href = "interest.html"; // Redireciona para a tela de seleção de interesses.
    } else {
        alert("Email ou senha incorretos.");
    }
}

// Cadastro.

function registerUser() {
    const nome = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const senha = document.getElementById('register-password').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Verifica se o email já está cadastrado.
    const existente = users.find(user => user.email === email);
    if (existente) {
        alert("Email já cadastrado.");
        return;
    }

    const newUser = new User(nome, email, senha);
    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users));

    alert("Usuário cadastrado com sucesso!");
}


// Eventos de clique

document.addEventListener('DOMContentLoaded', () => {
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
