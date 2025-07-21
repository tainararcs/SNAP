import { prepararPostParaFeed } from './posts.js';
import { User } from './User.js';

const feedContainer = document.getElementById('feed-container');
const initialLoadingMessage = document.getElementById('initial-loading-message');
const userDisplayName = document.getElementById('user-display-name');

const NUMBER_OF_POSTS_TO_GENERATE = 20;
const INTERVAL_BETWEEN_POSTS_MS = 2500;

let currentUser;
const storedUser = localStorage.getItem('user');

const homeLink = document.getElementById("link-home");
homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveLink("link-home");
    showPage("page-feed");
});

if (storedUser) {
  const userData = JSON.parse(storedUser);

  if (userData.theme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  currentUser = new User(
    userData.id || Math.floor(Math.random() * 1000) + 1,
    userData.name || "Usuário Generativo",
    userData.email || "email@example.com",
    userData.senha || "defaultpass"
  );

  if (userData.interests && Array.isArray(userData.interests) && userData.interests.length > 0) {
    currentUser.addInterestList(userData.interests);
  } else {
    currentUser.addInterestList(["tecnologia", "inovação", "futuro", "inteligencia artificial", "curiosidades"]);
  }

  if (userDisplayName) {
    userDisplayName.textContent = currentUser.getName();
  }

} else {
  alert("Você precisa estar logado para acessar o feed. Redirecionando para o login.");
  window.location.href = 'index.html';
}

function addPostToFeedDOM(postData) {
  if (initialLoadingMessage && initialLoadingMessage.parentNode) {
    initialLoadingMessage.remove();
  }

  const postCard = document.createElement('div');
  postCard.className = 'post-card';
  const postTime = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  const hashtagsHtml = postData.hashtags;

  postCard.innerHTML = `
    <div class="post-header">
      <img src="${postData.avatarUrl}" alt="${postData.nomeUsuario}" class="post-avatar" onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
      <a href="#" class="clicavel" data-user="${postData.nomeUsuario}"> ${postData.nomeUsuario}</a>
      <span class="post-time">${postTime}</span>
    </div>
    <p class="post-content">${postData.conteudo}</p>
    <p class="post-hashtags">${hashtagsHtml}</p>
  `;
  feedContainer.prepend(postCard);

  postCard.querySelectorAll(".hashtag-link")
  .forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const hashtag = e.target.dataset.hashtag;

      localStorage.setItem('searchQuery', hashtag);

      const searchLink = document.getElementById("link-search");

      if(searchLink) searchLink.click();
    });
  });
}

async function generateAndAddSinglePost() {
  const generatingMessage = document.createElement('p');
  generatingMessage.className = 'generating-message active';
  generatingMessage.textContent = 'Gerando post...';
  feedContainer.prepend(generatingMessage);

  try {
    const post = await prepararPostParaFeed(currentUser);
    generatingMessage.remove();

    if (post) {
      addPostToFeedDOM(post);
    } else {
      const errorCard = document.createElement('div');
      errorCard.className = 'post-card error-card';
      errorCard.innerHTML = `<p class="post-content" style="color: red;">Erro ao gerar o post.</p>`;
      feedContainer.prepend(errorCard);
    }
  } catch (error) {
    generatingMessage.remove();
    const errorCard = document.createElement('div');
    errorCard.className = 'post-card error-card';
    errorCard.innerHTML = `<p class="post-content" style="color: red;">Erro inesperado: ${error.message}</p>`;
    feedContainer.prepend(errorCard);
  }
}

async function startAutomaticPostGeneration(count, interval) {
  for (let i = 0; i < count; i++) {
    await generateAndAddSinglePost();
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    startAutomaticPostGeneration(NUMBER_OF_POSTS_TO_GENERATE, INTERVAL_BETWEEN_POSTS_MS);
    setActiveLink('link-home'); // garante que o link esteja ativo no início
  }
});