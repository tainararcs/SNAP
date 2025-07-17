import { User } from './User.js'; // Importe a classe User
import {requisitarPost, requisitarUserData} from './gemini.js'

/* Controle de Taxa.
*  Define o tempo mínimo de atraso (em milissegundos) entre as requisições à API, 
*  evitando sobrecarga ou chamadas excessivas em curto intervalo.
*/
const TEMPO_CONTROLE = 1500; // 1,5 seg - Mantenha esse controle para as requisições combinadas.
let lastRequestTime = 0; // Armazena o timestamp da última requisição.

/**
 * Função utilitária para introduzir um atraso.
 * @param {number} ms - Milissegundos para atrasar.
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

        // Controle de Taxa: Verifica e aplica atraso antes das requisições combinadas.
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < TEMPO_CONTROLE) {
            const timeToWait = TEMPO_CONTROLE - timeSinceLastRequest;
            console.log(`Aguardando ${timeToWait}ms para respeitar o limite de taxa para requisições múltiplas.`);
            await delay(timeToWait);
        }
        lastRequestTime = Date.now(); // Atualiza o tempo da última requisição.

        // Faz as duas requisições em paralelo.
        const [postContentArray, userData] = await Promise.all([
            requisitarPost(interessesDoUsuario), // Conteúdo e hashtags.
            requisitarUserData() // Dados do usuário fictício.
        ]);

        const [conteudo, hashtagsArray] = postContentArray; // Desestrutura a resposta do post.

        // Verifica se ambos os dados foram obtidos com sucesso.
        if (conteudo && userData && userData.nome) { // Assumindo que userData.nome é o nome gerado.

            // O avatarId é gerado aleatoriamente para o avatar com base no id do usuário fictício.
            const avatarIdFromUserData = userData.id % 70 || Math.floor(Math.random() * 70) + 1;
            const avatarUrl = `https://i.pravatar.cc/150?img=${avatarIdFromUserData}`;
            
            armazenarUsuarioEPost(userData, conteudo, hashtagsArray, avatarUrl);

            return {
                nomeUsuario: userData.nome, // Nome gerado pelo Gemini via requisitarUserData.
                avatarUrl: avatarUrl,       // Avatar baseado no id gerado pelo Gemini.
                conteudo: conteudo,
                hashtags: hashtagsArray.map(tag => `${tag.replace(/\s/g, '_')}`).join(' ') // Formata hashtags.
            };


        } else {
            console.error("Dados de post ou usuário fictício incompletos:", { conteudo, userData });
            return null;
        }
    } catch (error) {
        console.error("Erro ao preparar post para o feed:", error);
        return null;
    }
} // function prepararPostParaFeed


// Recupera os usuários armazenados no localStorage, ou retorna um array vazio.
export function getStoredUsers() {
  return JSON.parse(localStorage.getItem('usuarios') || '[]');
}

// Salva um array de usuários no localStorage com a chave 'usuarios'.
export function saveStoredUsers(users) {
  localStorage.setItem('usuarios', JSON.stringify(users));
}

// Retorna o próximo ID disponível com base no maior ID já usado. Se não houver usuários, começa com 1.
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
export function armazenarUsuarioEPost(userData, conteudo, hashtagsArray, avatarUrl) {
    const users = getStoredUsers();

    // Verifica se o usuário já existe com base no email.
    const userExistente = users.find(user => user.email === userData.email);

    let id;

    if (userExistente) {
        id = userExistente.id;
    } else {
        id = getNextUserId();
    }

    // Cria um novo objeto de post.
    const novoPost = {
        conteudo,
        hashtags: hashtagsArray.join(' '),
        avatarUrl,
        data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    };

    if (userExistente) {
        userExistente.posts.push(novoPost);
    } else {
        // Se for um novo usuário, cria um novo objeto com o post e adiciona ao array de usuários.
        const novoUsuario = {
            id,
            nome: userData.nome,
            email: userData.email,
            senha: userData.senha,
            interests: hashtagsArray,
            posts: [novoPost]
        };
        users.push(novoUsuario);
    }

    // Atualiza o localStorage.
    saveStoredUsers(users);

    // Retorna o ID do usuário.
    return id;
}