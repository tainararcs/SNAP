// posts.js !!! TEMPORÁRIO

import { requisitarPost } from '/server/gemini.js'; 
import { User } from './User.js'; // Assumindo que a classe User está em 'User.js' no mesmo diretório ou caminho relativo.


/* Controle de Taxa 
*Define o tempo mínimo de atraso (em milissegundos) entre as requisições à API.*/
const TEMPO_CONTROLE = 1500; //1,5seg
let lastRequestTime = 0; // Armazena o timestamp da última requisição

/**
 * Função utilitária para introduzir um atraso.
 * @param {number} ms - Milissegundos para atrasar.
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Prepara um post gerado pela API Gemini para ser exibido no feed,
 * utilizando os dados de um objeto User fornecido.
 *
 * @param {User} user - O objeto User que está gerando o post.
 * @returns {Promise<object | null>} Um objeto com as propriedades 'conteudo', 'hashtags',
 * 'nomeUsuario' e 'avatarUrl', ou null se houver um erro na geração do post.
 */
export async function prepararPostParaFeed(user) {
    if (!(user instanceof User)) {
        console.error("Erro: O argumento fornecido não é uma instância da classe User.");
        return null;
    }

    try {
        // Controle de Taxa: Verifica e aplica atraso antes da requisicao
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < TEMPO_CONTROLE) {
            const timeToWait = TEMPO_CONTROLE - timeSinceLastRequest;
            console.log(`Aguardando ${timeToWait}ms para respeitar o limite de taxa.`);
            await delay(timeToWait);
        }
        lastRequestTime = Date.now(); // Atualiza o tempo da última requisição
        // Fim do Controle de Taxa

        // Solicita o post API Gemini, passando os interesses do usuário
        const [textoDoPost, interessesDoPost] = await requisitarPost(user.getInterests());

        // Usa os dados do usuário fornecido
        const nomeUsuario = user.getName();
        const avatarUrl = user.getAvatarUrl(); // Usa o novo método para obter o avatar

        // Verifica se o texto do post foi gerado com sucesso
        if (textoDoPost) {
            // Formata os interesses como uma string de hashtags, se existirem
            const hashtagsFormatadas = interessesDoPost.length > 0 
                ? interessesDoPost.map(tag => `#${tag}`).join(' ') // Adiciona '#' a cada hashtag
                : '';

            // Retorna o objeto do post formatado para o feed, com as informações do usuário
            return {
                conteudo: textoDoPost,
                hashtags: hashtagsFormatadas,
                nomeUsuario: nomeUsuario,
                avatarUrl: avatarUrl,
            };
        } else {
            console.warn("Não foi possível gerar o conteúdo do post. Retornando null.");
            return null;
        }
    } catch (error) {
        console.error("Erro ao preparar o post para o feed:", error);
        return null;
    }
}