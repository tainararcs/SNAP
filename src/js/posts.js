// posts.js

import { requisitarPost } from './gemini.js'; 


/* Controle de Taxa 
*Define o tempo mínimo de atraso (em milissegundos) entre as requisições à API.*/
const TEMPO_CONTROLE = 1500; //1,5seg
let lastRequestTime = 0; // Armazena o timestamp da última requisição


//  Dados para geração aleatória de usuário e avatar 
const AVATAR_BASE_URL = "https://i.pravatar.cc/150?img="; // Um gerador de avatares aleatórios
const NOME_USUARIOS_ALEATORIOS = [
    "Ana Silva", "Bruno Miranda", "Carla Oliveira", "Daniel Tolendal", "Wender Magno",
    "Fabio Arts", "Gabriela.P", "Hugo Gamer", "Isabela_Mkt", "Joao dos Venenos",
    "Kelly Bakes", "Lucas Coding", "Rafael Silva", "Carlos Junior", "Olivia Oliveira",
    "Pedro Antonio", "Igor Guilherme", "Rafa Sports", "Sofia Fotografias", "Thiago Bits"
];
//  Fim dos dados de geração 

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
 * Função utilitária para introduzir um atraso.
 * @param {number} ms - Milissegundos para atrasar.
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        //  Controle de Taxa: Verifica e aplica atraso antes da requisição
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        if (timeSinceLastRequest < TEMPO_CONTROLE) {
            const timeToWait = TEMPO_CONTROLE - timeSinceLastRequest;
            console.log(`Aguardando ${timeToWait}ms para respeitar o limite de taxa.`);
            await delay(timeToWait);
        }
        lastRequestTime = Date.now(); // Atualiza o tempo da última requisição
        // Fim do Controle de Taxa

        // Solicita o post à API Gemini
        const [textoDoPost, interessesDoPost] = await requisitarPost(apiKey, interessesPredefinidos);

        // Gera o usuário e avatar fictícios localmente
        const perfilDoUsuario = gerarUsuarioFicticio();

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
                nomeUsuario: perfilDoUsuario.nomeUsuario,
                avatarUrl: perfilDoUsuario.avatarUrl,
                bio: perfilDoUsuario.bio
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