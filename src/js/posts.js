import { User } from './User.js'; // Importe a classe User

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
 * Requisita ao backend um conteúdo de post com base nos interesses fornecidos.
 * @param {string[]} interessesPredefinidos - Lista de interesses para gerar o conteúdo.
 * @returns Conteúdo do post e hashtags associadas.
 */
async function _requisitarPostInterno(interessesPredefinidos = null) {
    try {
        const response = await fetch('http://localhost:3001/requisitarPost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interesses: interessesPredefinidos || [] })
        });

        if (!response.ok) { // Verifica se a resposta HTTP foi bem-sucedida.
            const errorBody = await response.text();
            throw new Error(`Erro HTTP: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        
        // Retorna o conteúdo e hashtags.
        return [data.texto, data.interesses];

    } catch(error) {
        console.error('Erro ao obter post:', error);
        return [null, interessesPredefinidos || []];
    }
} // function _requisitarPostInterno

/**
 * Requisita ao backend os dados de um usuário fictício.
 * @returns {Promise<Object|null>} - Objeto com dados do usuário ou null em caso de erro.
 */
async function _requisitarUserDataInterno() {
    try {
        const response = await fetch('http://localhost:3001/requisitarUserData', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) { // Verifica se a resposta HTTP foi bem-sucedida.
            const errorBody = await response.text();
            throw new Error(`Erro HTTP: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        return data;

    } catch(error) {
        console.error('Erro ao obter dados do usuário fictício:', error);
        return null;
    }
} // function _requisitarUserDataInterno


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
            _requisitarPostInterno(interessesDoUsuario), // Conteúdo e hashtags.
            _requisitarUserDataInterno() // Dados do usuário fictício.
        ]);

        const [conteudo, hashtagsArray] = postContentArray; // Desestrutura a resposta do post.

        // Verifica se ambos os dados foram obtidos com sucesso.
        if (conteudo && userData && userData.nome) { // Assumindo que userData.nome é o nome gerado.

            // O avatarId é gerado aleatoriamente para o avatar com base no id do usuário fictício.
            const avatarIdFromUserData = userData.id % 70 || Math.floor(Math.random() * 70) + 1;
            const avatarUrl = `https://i.pravatar.cc/150?img=${avatarIdFromUserData}`;

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
