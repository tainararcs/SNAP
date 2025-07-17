import { User, updateUserTheme } from './User.js';

let loginPage;
let recoverPage;
let themeToggle;
let themeDark = false; // Variável para controlar o tema escuro

document.addEventListener('DOMContentLoaded', () => {

	// Desktop
	const signUpButton = document.getElementById('signUp');
	const signInButton = document.getElementById('signIn');
	const container = document.getElementById('container-login');
	const loginForm = document.getElementById('login-form-login');
	const registerForm = document.getElementById('register-form-login');

	// Recuperar senha
	const forgotPasswordLink = document.getElementById('forgot-password-link');
	const forgotPasswordContainer = document.querySelector('.forgot-password-container');
	const backToLoginBtn = document.getElementById('back-to-login');
	const recoverBtn = document.getElementById('recover-btn');

	// Mobile
	const mobileLoginForm = document.getElementById('mobile-login-form');
	const mobileRegisterForm = document.getElementById('mobile-register-form');
	loginPage = document.getElementById('login-page');
	const signupPage = document.getElementById('signup-page');

	// Recuperar senha Mobile
	const mobileRecoverForm = document.getElementById('mobile-recover-form');
	recoverPage = document.getElementById('recover-page');
	const recoverBtnMobile = document.getElementById('recover-btn-mobile');
	const backToLoginMobile = document.getElementById('back-to-login-mobile');

	// Botões de troca (mobile)
	const mobileToRegister = signupPage?.querySelector('a[href="/login"]'); // Entrar
	const mobileToLogin = loginPage?.querySelector('a[href="/register"]');   // Cadastre-se
	const recoverLinkMobile = document.getElementById('recover-link-mobile');
	
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

	// Recuperar senha
	forgotPasswordLink?.addEventListener('click', (e) => {
		loginForm.style.display = 'none';
		forgotPasswordContainer.style.display = 'block';
	});

	recoverLinkMobile?.addEventListener('click', (e) => {
		e.preventDefault();
		loginPage.style.display = 'none';
		signupPage.style.display = 'none';
		recoverPage.style.display = 'block';
	});

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

	recoverBtn?.addEventListener('click', (e) =>{
		e.preventDefault();
		recoverPassword();
	});

	backToLoginBtn?.addEventListener('click', (e) => {
		e.preventDefault();
		forgotPasswordContainer.style.display = 'none';
		loginForm.style.display = 'flex';
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

	mobileRecoverForm?.addEventListener('submit', (e) => {
		e.preventDefault();
		recoverPassword();
	});	
	
	recoverBtnMobile?.addEventListener('click', (e) => {
		e.preventDefault();
		recoverPassword(true); // Passa true para indicar que é mobile
	});

	backToLoginMobile?.addEventListener('click', (e) => {
		e.preventDefault();
		recoverPage.style.display = 'none';
		loginPage.style.display = 'block';
	});

	// Tema escuro
	themeToggle = document.getElementById('dark-mode-toggle');

	themeToggle.onclick = function() {
		if(!themeDark){
			themeDark = true;	
			document.body.classList.add('dark-mode');
		}else{
			themeDark = false;
			document.body.classList.remove('dark-mode');
		}
	}	
	
});

/**
 * Realiza o login do usuário com base no e-mail e senha informados.
 * Valida os dados com as informações armazenadas no localStorage.
 */
function loginUser() {
	const email = document.getElementById('login-email')?.value.trim() || document.getElementById('email-login')?.value.trim();
	const senha = document.getElementById('login-password')?.value || document.getElementById('password-login')?.value;
	const user = JSON.parse(localStorage.getItem('user'));

	if (user && user.email === email && user.senha === senha) {
		localStorage.setItem('LoggedUser', JSON.stringify(user));
		showAlert('Login bem-sucedido!', 'success');

		if (!user.interests || user.interests.length === 0) {
			updateUserTheme(themeDark);
			setTimeout(() => window.location.href = "interests.html", 1000);
		} else {
			updateUserTheme(themeDark);
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
	updateUserTheme(themeDark);
	setTimeout(() => window.location.href = "interests.html", 1000);
}

//Recuperar senha
function recoverPassword(isMobile = false) {
	const email = document.getElementById(isMobile ? 'recover-email-mobile' : 'recover-email')?.value.trim();
	const senha = document.getElementById(isMobile ? 'recover-password-mobile' : 'recover-password')?.value;
	const senha2 = document.getElementById(isMobile ? 'recover-password2-mobile' : 'recover-password2')?.value;

	if (!email || !senha || !senha2) {
		showAlert('Preencha todos os campos.', 'danger');
		return;
	}

	if (senha !== senha2) {
		showAlert('As senhas não coincidem.', 'danger');
		return;
	}

	const user = JSON.parse(localStorage.getItem('user'));

	if (user?.email.toLowerCase() === email.toLowerCase()) {
		user.senha = senha;
		
		localStorage.setItem('user', JSON.stringify(user));
		
		showAlert('Senha atualizada com sucesso!', 'success');
		
		if (isMobile) {
			loginPage.style.display = 'block';
			recoverPage.style.display = 'none';
		} else {
			document.getElementById('back-to-login')?.click();
		}
	} else {
		showAlert('E-mail não encontrado.', 'danger');
	}
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
	if (!alertDiv) return;

	alertDiv.className = `alert alert-${type} text-center global-alert`;
	alertDiv.textContent = message;
	alertDiv.classList.remove("d-none");
    
    // Oculta o alerta após determinado tempo.
	setTimeout(() => {
		alertDiv.classList.add("d-none");
	}, duration);
}
