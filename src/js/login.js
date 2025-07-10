import { User } from './User.js';

document.addEventListener('DOMContentLoaded', () => {
	// Desktop
	const signUpButton = document.getElementById('signUp');
	const signInButton = document.getElementById('signIn');
	const container = document.getElementById('container-login');
	const loginForm = document.getElementById('login-form-login');
	const registerForm = document.getElementById('register-form-login');

	// Mobile
	const mobileLoginForm = document.getElementById('mobile-login-form');
	const mobileRegisterForm = document.getElementById('mobile-register-form');
	const loginPage = document.getElementById('login-page');
	const signupPage = document.getElementById('signup-page');

	// Botões de troca (mobile)
	const mobileToRegister = signupPage?.querySelector('a[href="/login"]'); // Entrar
	const mobileToLogin = loginPage?.querySelector('a[href="/register"]');   // Cadastre-se

	// Exibir apenas login na inicialização do mobile
	if (window.innerWidth <= 768) {
		if (loginPage && signupPage) {
			loginPage.style.display = 'block';
			signupPage.style.display = 'none';
		}
	}

	// Alternar telas no mobile
	mobileToLogin?.addEventListener('click', (e) => {
		e.preventDefault();
		loginPage.style.display = 'none';
		signupPage.style.display = 'block';
	});

	mobileToRegister?.addEventListener('click', (e) => {
		e.preventDefault();
		loginPage.style.display = 'block';
		signupPage.style.display = 'none';
	});

	// Alternar tela desktop
	if (signUpButton && signInButton) {
		signUpButton.addEventListener('click', () => {
			container.classList.add("right-panel-active");
		});
		signInButton.addEventListener('click', () => {
			container.classList.remove("right-panel-active");
		});
	}

	// Submit - Desktop
	loginForm?.addEventListener('submit', (e) => {
		e.preventDefault();
		loginUser();
	});
	registerForm?.addEventListener('submit', (e) => {
		e.preventDefault();
		registerUser();
		registerForm.reset();
	});

	// Submit - Mobile
	mobileLoginForm?.addEventListener('submit', (e) => {
		e.preventDefault();
		loginUser();
	});
	mobileRegisterForm?.addEventListener('submit', (e) => {
		e.preventDefault();
		registerUser();
		mobileRegisterForm.reset();
	});
});

// Lógica de login e cadastro
function loginUser() {
	const email = document.getElementById('login-email')?.value.trim() || document.getElementById('email-login')?.value.trim();
	const senha = document.getElementById('login-password')?.value || document.getElementById('password-login')?.value;
	const user = JSON.parse(localStorage.getItem('user'));

	if (user && user.email === email && user.senha === senha) {
		localStorage.setItem('LoggedUser', JSON.stringify(user));
		showAlert('Login bem-sucedido!', 'success');

		if (!user.interests || user.interests.length === 0) {
			setTimeout(() => window.location.href = "interests.html", 1000);
		} else {
			setTimeout(() => window.location.href = "feed.html", 1000);
		}
	} else {
		showAlert('Email ou senha incorretos.', 'danger');
	}
}

function registerUser() {
	const nome = document.getElementById('register-name')?.value.trim() || document.getElementById('nome')?.value.trim();
	const email = document.getElementById('register-email')?.value.trim() || document.getElementById('email-signup')?.value.trim();
	const senha = document.getElementById('register-password')?.value || document.getElementById('password-signup')?.value;

	if (!nome || !email || !senha) {
		showAlert('Por favor, preencha todos os campos.', 'danger');
		return;
	}

	const newUser = new User(0, nome, email, senha);
	localStorage.setItem('user', JSON.stringify(newUser));

	showAlert('Usuário cadastrado com sucesso!', 'success');
	setTimeout(() => window.location.href = "interests.html", 1000);
}

function showAlert(message, type = "success", duration = 3000) {
	const alertDiv = document.getElementById("global-alert");
	if (!alertDiv) return;

	alertDiv.className = `alert alert-${type} text-center global-alert`;
	alertDiv.textContent = message;
	alertDiv.classList.remove("d-none");

	setTimeout(() => {
		alertDiv.classList.add("d-none");
	}, duration);
}
