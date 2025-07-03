// posts.js

import { requisitarPost } from './gemini.js'; 

// --- Dados para geração aleatória de usuário e avatar ---
const AVATAR_BASE_URL = "https://i.pravatar.cc/150?img="; // Um gerador de avatares aleatórios
const NOME_USUARIOS_ALEATORIOS = [
    "Ana Silva", "Bruno Miranda", "Carla Oliveira", "Daniel Tolendal", "Wender Magno",
    "Fabio Arts", "Gabriela.P", "Hugo Gamer", "Isabela_Mkt", "Joao dos Venenos",
    "Kelly Bakes", "Lucas Coding", "Rafael Silva", "Carlos Junior", "Olivia Oliveira",
    "Pedro Antonio", "Igor Guilherme", "Rafa Sports", "Sofia Fotografias", "Thiago Bits"
];
// --- Fim dos dados de geração ---

/**
 * Gera um nome de usuário e um URL de avatar aleatórios.
 * @returns {{nomeUsuario: string, avatarUrl: string}} Objeto com nome e URL do avatar.
 */
function gerarUsuarioFicticio() {
    const nomeAleatorio = NOME_USUARIOS_ALEATORIOS[Math.floor(Math.random() * NOME_USUARIOS_ALEATORIOS.length)];
    // Corrigido: gera IDs entre 1 e 70 (o serviço requer 1-70)
    const avatarId = Math.floor(Math.random() * 70) + 1;
    const avatarUrl = `${AVATAR_BASE_URL}${avatarId}`;
    return {
        nomeUsuario: nomeAleatorio,
        avatarUrl: avatarUrl
    };
}


/**
 * Prepara um post gerado pela API Gemini para ser exibido no feed,
 * incluindo um usuário e avatar fictícios.
 *
 * @param {string} apiKey - Sua chave de API do Gemini.
 * @param {string[] | null} [interessesPredefinidos=null] - Uma lista de interesses (hashtags) para o post.
 * Se não for fornecida ou for vazia, o Gemini gerará os interesses.
 * @returns {Promise<object | null>} Um objeto com as propriedades 'conteudo', 'hashtags',
 * 'nomeUsuario' e 'avatarUrl', ou null se houver um erro na geração do post.
 */
export async function prepararPostParaFeed(apiKey, interessesPredefinidos = null) {
    try {
        // Solicita o post à API Gemini
        const [textoDoPost, interessesDoPost] = await requisitarPost(apiKey, interessesPredefinidos);

        // Gera o usuário e avatar fictícios
        const { nomeUsuario, avatarUrl } = gerarUsuarioFicticio();

        // Verifica se o texto do post foi gerado com sucesso
        if (textoDoPost) {
            // Formata os interesses como uma string de hashtags, se existirem
            const hashtagsFormatadas = interessesDoPost.length > 0 
                ? interessesDoPost.join(' ') 
                : '';

            // Retorna o objeto do post formatado para o feed, com as novas informações
            return {
                conteudo: textoDoPost,
                hashtags: hashtagsFormatadas,
                nomeUsuario: nomeUsuario,
                avatarUrl: avatarUrl
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