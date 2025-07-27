import { User } from './User.js';
import { requisitarPost, requisitarUserData, requisitarBioUsuarioF } from './gemini.js'; // Importação corrigida

/**
 * Prepara um post para o feed, solicitando conteúdo e dados de usuário fictício separadamente ao backend (Gemini).
 * O conteúdo do post será baseado nos interesses do usuário logado.
 *
 * @param {User} currentUser - O objeto User contendo os interesses do usuário logado.
 * @returns {Promise<object|null>} Um objeto com os dados do post ou null em caso de erro.
 */
export async function prepararPostParaFeed(currentUser) {
    if (!currentUser || !currentUser.getInterests || currentUser.getInterests().length === 0) {
        console.error("Erro: Usuário ou interesses não definidos para gerar post.");
        return null;
    }

    const interessesDoUsuario = currentUser.getInterests();
    console.log("Solicitando post e dados de usuário fictício do backend com base nos interesses:", interessesDoUsuario);

    try {
        const [postContentArray, userData] = await Promise.all([
            requisitarPost(interessesDoUsuario),
            requisitarUserData()
        ]);

        const [conteudo, hashtagsArray] = postContentArray;

        if (conteudo && userData && userData.nome) {
            const avatarIdFromUserData = userData.id % 70 || Math.floor(Math.random() * 70) + 1;
            const avatarUrl = `https://i.pravatar.cc/150?img=${avatarIdFromUserData}`;
            
            await armazenarUsuarioEPost(userData, conteudo, hashtagsArray, avatarUrl);

            return {
                nomeUsuario: userData.nome,
                avatarUrl: avatarUrl,
                conteudo: conteudo,
                hashtags: hashtagsArray.map(tag => {
                    const hashtag = `${tag.replace(/\s/g, '_')}`;
                    return `<a href="#" class="hashtag-link" data-hashtag="${hashtag}">${hashtag}</a>`;
                }).join(' ')
            };
        } else {
            console.error("Dados de post ou usuário fictício incompletos:", { conteudo, userData });
            return null;
        }
    } catch (error) {
        console.error("Erro ao preparar post para o feed:", error);
        return null;
    }
}

// Recupera os usuários armazenados
export function getStoredUsers() {
    return JSON.parse(localStorage.getItem('usuarios') || '[]');
}

// Salva usuários
export function saveStoredUsers(users) {
    localStorage.setItem('usuarios', JSON.stringify(users));
}

// Retorna o próximo ID disponível
export function getNextUserId() {    
    const users = getStoredUsers();
    return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
}

/**
 * Armazena ou atualiza um usuário fictício com um novo post.
 * @param {object} userData - Dados do usuário gerado pela IA ({ nome, email, senha }).
 * @param {string} conteudo - Conteúdo do post.
 * @param {string[]} hashtagsArray - Lista de hashtags.
 * @param {string} avatarUrl - URL do avatar associado ao post.
 */
export async function armazenarUsuarioEPost(userData, conteudo, hashtagsArray, avatarUrl) {
    const users = getStoredUsers();
    const userExistente = users.find(user => user.email === userData.email);
    let id;

    if (userExistente) {
        id = userExistente.id;
    } else {
        id = getNextUserId();
    }

    const novoPost = {
        conteudo,
        hashtags: hashtagsArray.join(' '),
        avatarUrl,
        data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    };

    if (userExistente) {
        userExistente.posts.push(novoPost);
    } else {
        let bio = null;
        try {
            // Tentar gerar a bio durante o feed
            bio = await requisitarBioUsuarioF(hashtagsArray, userData.nome);
        } catch (error) {
            console.error("Erro ao gerar bio para usuário fictício:", error);
            // Deixa a bio como null para tentar gerar depois no perfil
        }
        
        const novoUsuario = {
            id,
            nome: userData.nome,
            email: userData.email,
            senha: userData.senha,
            interests: hashtagsArray,
            bio, // Pode ser null se falhou
            posts: [novoPost]
        };
        users.push(novoUsuario);
    }

    saveStoredUsers(users);
    return id;
}