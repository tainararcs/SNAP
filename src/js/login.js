// login.js
import { User } from './User.js';

document.addEventListener('DOMContentLoaded', () => {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container-login');

    // Alterna entre login e cadastro
    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });

    const loginForm = document.getElementById('login-form-login');
    const registerForm = document.getElementById('register-form-login');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginUser();
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registerUser();
        registerForm.reset();
    });
});

function loginUser() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-password').value;

    const user = JSON.parse(localStorage.getItem('user'));

    if (user && user.email === email && user.senha === senha) {
        localStorage.setItem('LoggedUser', JSON.stringify(user));
        showMessageLogin("Login bem-sucedido!");
        setTimeout(() => window.location.href = "feed.html", 1000);
    } else {
        showMessageLogin("Email ou senha incorretos.");
    }
}

function registerUser() {
    const nome = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const senha = document.getElementById('register-password').value;

    const newUser = new User(0, nome, email, senha);
    localStorage.setItem('user', JSON.stringify(newUser));

    showMessageRegister("Usuário cadastrado com sucesso!");
    setTimeout(() => window.location.href = "interests.html", 1000);
}

function showMessageLogin(message) {
    document.getElementById('login-message').innerHTML = `<div class="mensagem">${message}</div>`;
}

function showMessageRegister(message) {
    document.getElementById('register-message').innerHTML = `<div class="mensagem">${message}</div>`;
}
