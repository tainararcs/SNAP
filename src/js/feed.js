import { prepararPostParaFeed } from './posts.js';
import { User } from './User.js';
import { getStoredUsers } from './posts.js';

const feedContainer = document.getElementById('feed-container');
const initialLoadingMessage = document.getElementById('initial-loading-message');
const userDisplayName = document.getElementById('user-display-name');

const loadMoreButton = document.createElement('button');
loadMoreButton.className = 'btn-load-more';
loadMoreButton.innerHTML = '<i class="fas fa-sync-alt"></i> Ver mais posts';
let currentPostCount = 0;

const NUMBER_OF_POSTS_TO_GENERATE = 10;
const INTERVAL_BETWEEN_POSTS_MS = 0;
const MAX_RETRY_ATTEMPTS = 3;

let currentUser;
let postGenerationActive = true;
const storedUser = localStorage.getItem('user');

const homeLink = document.getElementById("link-home");
homeLink.addEventListener("click", (e) => {
    e.preventDefault();
    setActiveLink("link-home");
    showPage("page-feed");
});

// Função para inicializar o usuário
function initializeUser() {
    if (!storedUser) {
        alert("Você precisa estar logado para acessar o feed. Redirecionando para o login.");
        window.location.href = 'index.html';
        return false;
    }

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

    const defaultInterests = ["tecnologia", "inovação", "futuro", "inteligencia artificial", "curiosidades"];
    currentUser.addInterestList(
        userData.interests && Array.isArray(userData.interests) && userData.interests.length > 0
            ? userData.interests
            : defaultInterests
    );

    if (userDisplayName) {
        userDisplayName.textContent = currentUser.getName();
    }

    return true;
}

// Função para adicionar post ao DOM com tratamento robusto
function addPostToFeedDOM(postData) {
    if (!postData || !postData.nomeUsuario || !postData.conteudo) {
        console.warn("Dados de post inválidos:", postData);
        return;
    }

    try {
        if (initialLoadingMessage && initialLoadingMessage.parentNode) {
            initialLoadingMessage.remove();
        }

        const postTime = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        const hashtagsHtml = postData.hashtags || '';
        const avatarUrl = postData.avatarUrl || 'https://via.placeholder.com/40';

        const postCard = document.createElement('div');
        postCard.className = 'post-card';

        postCard.innerHTML = `
            <div class="post-header">
                <img src="${avatarUrl}" alt="${postData.nomeUsuario}" class="post-avatar" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/40'">
                <a href="#" class="clicavel" data-user="${postData.nomeUsuario}">${postData.nomeUsuario}</a>
                <span class="post-time">${postTime}</span>
            </div>
            <p class="post-content">${postData.conteudo}</p>
            <p class="post-hashtags">${hashtagsHtml}</p>
        `;

        feedContainer.prepend(postCard);

        // Configura eventos de clique para hashtags
        postCard.querySelectorAll(".hashtag-link").forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const hashtag = e.target.dataset.hashtag;
                if (hashtag) {
                    localStorage.setItem('searchQuery', hashtag);
                    const searchLink = document.getElementById("link-search");
                    if (searchLink) searchLink.click();
                }
            });
        });

    } catch (error) {
        console.error("Erro ao adicionar post ao DOM:", error);
    }
}

// Função para gerar post com retentativas
async function generatePostWithRetry(attempts = MAX_RETRY_ATTEMPTS) {
    try {
        const post = await prepararPostParaFeed(currentUser);
        if (post && post.nomeUsuario && post.conteudo) {
            return post;
        }
        throw new Error("Dados de post incompletos");
    } catch (error) {
        if (attempts <= 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
        return generatePostWithRetry(attempts - 1);
    }
}

// Função para gerar e adicionar um único post
async function generateAndAddSinglePost() {
    if (!postGenerationActive) return;

    // Mensagem fixa de carregamento
    const generatingMessage = document.createElement('div');
    generatingMessage.className = 'generating-message active';
    generatingMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando o feed com posts personalizados para você...';
    
    // Remove qualquer mensagem existente antes de adicionar a nova
    const existingMessage = document.querySelector('.generating-message.active');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Adiciona a mensagem no topo do container
    feedContainer.prepend(generatingMessage);

    try {
        const post = await generatePostWithRetry();
        addPostToFeedDOM(post);
        currentPostCount++;
        updateLoadMoreButton();

        // Remove a mensagem após um pequeno delay para dar tempo de ser vista
        setTimeout(() => {
            if (generatingMessage.parentNode) {
                generatingMessage.remove();
            }
        }, 500);
    } catch (error) {
        console.error("Falha ao gerar post após várias tentativas:", error);
    }  
}

function updateLoadMoreButton() {
    if (currentPostCount >= NUMBER_OF_POSTS_TO_GENERATE) {
        if (!document.querySelector('.btn-load-more')) {
            loadMoreButton.addEventListener('click', async () => {
                loadMoreButton.disabled = true;
                loadMoreButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
                await startAutomaticPostGeneration(NUMBER_OF_POSTS_TO_GENERATE, INTERVAL_BETWEEN_POSTS_MS);
                loadMoreButton.disabled = false;
                loadMoreButton.innerHTML = '<i class="fas fa-sync-alt"></i> Ver mais posts';
            });
            feedContainer.appendChild(loadMoreButton);
        }
    }
}

// Função principal para gerar posts automaticamente
async function startAutomaticPostGeneration(count = NUMBER_OF_POSTS_TO_GENERATE, interval = INTERVAL_BETWEEN_POSTS_MS) {
    if (!initializeUser()) return;

    for (let i = 0; i < count && postGenerationActive; i++) {
        await generateAndAddSinglePost();
        if (i < count - 1) {
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
}

// Função para carregar recomendações (MODIFICADA)
function loadRecommendations() {
    try {
        const container = document.querySelector('.suggestions-list');
        if (!container) return;

        const users = getStoredUsers();
        const currentUserData = JSON.parse(localStorage.getItem('user'));

        if (!users?.length || !currentUserData) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p class="empty-message">Ainda estamos vazios por aqui...</p>
                    <small class="empty-hint">Assim que os primeiros usuários aparecerem, você verá sugestões de contas incríveis</small>
                    <button class="btn-reload" onclick="window.location.reload()">
                        <i class="fas fa-sync-alt"></i> Recarregar
                    </button>
                </div>
            `;
            return;
        }

        // Restante da função original permanece IGUAL
        const recommendations = users
            .filter(user =>
                user.nome &&
                user.nome !== currentUserData.name &&
                user.posts?.length > 0
            )
            .slice(0, 4)
            .map(user => {
                const userPhoto = user.profileImage ||
                    user.posts?.[0]?.avatarUrl ||
                    'https://i.pravatar.cc/150?img=3';

                return `
                    <a href="#" class="profile-suggestion" data-user="${user.nome}">
                        <img src="${userPhoto}" 
                             alt="${user.nome}" 
                             class="recommended-user-avatar"
                             onerror="this.onerror=null; this.src='https://i.pravatar.cc/150?img=3'">
                        <span>${user.nome}</span>
                    </a>
                `;
            });

        container.innerHTML = recommendations.length
            ? recommendations.join('')
            : '<p class="small">Nenhuma recomendação disponível</p>';

        // Configura eventos de clique para recomendações
        container.querySelectorAll('.profile-suggestion').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const userName = this.dataset.user;
                const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                Object.defineProperty(event, 'target', {
                    value: {
                        classList: { contains: (cls) => cls === 'clicavel' },
                        dataset: { user: userName }
                    }
                });
                document.dispatchEvent(event);
            });
        });

    } catch (error) {
        console.error("Erro ao carregar recomendações:", error);
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    startAutomaticPostGeneration(NUMBER_OF_POSTS_TO_GENERATE, INTERVAL_BETWEEN_POSTS_MS);
    setActiveLink('link-home');
    loadRecommendations();
    setupMobileMenuBehavior();
});



function setupMobileMenuBehavior() {
    const links = document.querySelectorAll('.nav-link');
    const mobileTitleWrapper = document.querySelector('.mobile-title');
    const mobileTitleText = mobileTitleWrapper.querySelector('span');
    const logo = document.querySelector('.mobile-logo');

    links.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const newTitle = link.getAttribute('data-title');

            // Animação Animate.css
            logo.classList.remove('animate__animated', 'animate__fadeInLeft');
            void mobileTitleText.offsetWidth;
            logo.classList.add('animate__animated', 'animate__fadeInLeft');

            if (newTitle !== "Configurações") {
                document.getElementById('link-configs').style.display = 'flex';
            }

            if (newTitle === "Configurações") {
                if (window.innerWidth < 768) {
                    document.getElementById('link-configs').style.display = 'none';
                    mobileTitleWrapper.style.display = 'flex';
                    mobileTitleWrapper.style.justifyContent = 'center';
                    mobileTitleWrapper.style.paddingLeft = '0px';
                    mobileTitleText.textContent = "Configurações";
                }
            } else if (newTitle === "Criar") {
                mobileTitleText.textContent = "Criar";
                return;
            } else {
                document.getElementById('link-configs').style.display = 'flex';
                mobileTitleWrapper.style.display = 'flex';
                mobileTitleWrapper.style.justifyContent = 'flex-start';
                mobileTitleWrapper.style.paddingLeft = '70px';
                mobileTitleText.textContent = newTitle;
            }
        });
    });
}


// Limpeza quando a página for fechada
window.addEventListener('beforeunload', () => {
    postGenerationActive = false;
});