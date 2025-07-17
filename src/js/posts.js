// js/posts.js

import { User } from './User.js'; // Importa a classe User para validação e obtenção de interesses

/* Controle de Taxa
 * Define o tempo mínimo de atraso (em milissegundos) entre as requisições combinadas ao backend.
 */
const TEMPO_CONTROLE_REQUISICOES_MS = 5000; // 5 segundos
let ultimoTempoRequisicao = 0; // Armazena o timestamp da última requisição combinada
/**
 * Função utilitária para introduzir um atraso.
 * @param {number} milissegundos - Milissegundos para atrasar a execução.
 * @returns {Promise<void>} 
 */
function atrasar(milissegundos) {
    return new Promise(resolver => setTimeout(resolver, milissegundos));
}

/**
 * Requisita o conteúdo e as hashtags de um post ao servidor backend.
 * @param {string[]} interessesParaPost - Lista de interesses para guiar a geração do post.
 * @returns {Promise<[string|null, string[]]>} texto do post e array de hashtags, ou null em caso de erro
 */
async function requisitarConteudoPost(interessesParaPost = []) {
    try {
        const resposta = await fetch('http://localhost:3001/requisitarPost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interesses: interessesParaPost })
        });

        if (!resposta.ok) {
            const corpoErro = await resposta.text();
            console.error('Erro HTTP ao obter conteúdo do post (Status:', resposta.status, 'Corpo:', corpoErro, ')');
            throw new Error(`Backend retornou erro ${resposta.status} para /requisitarPost: ${corpoErro}`);
        }

        const dados = await resposta.json();
        return [dados.texto || null, Array.isArray(dados.interesses) ? dados.interesses : []];

    } catch(erro) {
        console.error('Erro ao chamar /requisitarPost:', erro.message || erro);
        return [null, interessesParaPost || []]; // Retorna null caso erro
    }
}
/**
 * Requisita dados para um usuário fictício (nome, email, senha) ao servidor backend.
 * @returns {Promise<object|null>} Um objeto com 'nome', 'email', 'senha' do usuário fictício, ou null em caso de erro.
 */
async function requisitarDadosUsuarioFicticio() {
    try {
        const resposta = await fetch('http://localhost:3001/requisitarUserData', {
            method: 'GET', // Sua rota é GET
            headers: { 'Content-Type': 'application/json' },
        });

        if (!resposta.ok) {
            const corpoErro = await resposta.text();
            console.error('Erro HTTP ao obter dados do usuário fictício (Status:', resposta.status, 'Corpo:', corpoErro, ')');
            throw new Error(`Backend retornou erro ${resposta.status} para /requisitarUserData: ${corpoErro}`);
        }

        const dados = await resposta.json();
        // Se o backend retorna um objeto com 'error', tratamos como falha
        if (dados && dados.error) {
            console.error("Erro reportado pelo backend em /requisitarUserData:", dados.error);
            return null; // Retorna null em caso de erro
        }
        return dados; 

    } catch(erro) {
        console.error('Erro ao chamar /requisitarUserData:', erro.message || erro);
        return null;
    }
}

/**
 * Requisita ao servidor o caminho para uma imagem de perfil gerada para um nome de usuário.
 * O backend salva a imagem e retorna o caminho.
 *
 * @param {string} nomeUsuario - O nome de usuário fictício para basear a imagem.
 * @returns {Promise<string|null>} A URL completa da imagem de perfil, ou null em caso de erro.
 */
async function requisitarImagemPerfil(nomeUsuario) {
    try {
        const resposta = await fetch('http://localhost:3001/requisitarImagemPerfil', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ username: nomeUsuario }) 
        });
        if (!resposta.ok) {
            const corpoErro = await resposta.text();
            console.error('Erro HTTP ao obter imagem de perfil (Status:', resposta.status, 'Corpo:', corpoErro, ')');
            throw new Error(`Backend retornou erro ${resposta.status} para /requisitarImagemPerfil: ${corpoErro}`);
        }

        // A resposta do backend é o caminho relativo da imagem (ex: "public/img/Nome.png")
        const caminhoImagem = await resposta.text();
        const urlBaseBackend = 'http://localhost:3001'; 
        // Monta a URL completa para que o navegador possa acessar a imagem
        return `${urlBaseBackend}/${caminhoImagem.replace(/^public\//, '')}`;

    } catch(erro) {
        console.error('Erro ao chamar /requisitarImagemPerfil:', erro.message || erro);
        return null;
    }
}


/**
 * Monta um post para o feed.
 * 1. Obter o conteúdo do post e hashtags (baseado nos interesses do usuário logado).
 * 2. Obter dados de um usuário fictício (nome, email, etc.).
 * 3. Obter uma imagem de perfil para o usuário fictício.
 * Todas as requisições são feitas ao backend usando o GEMINI
 *
 * @param {User} usuarioLogado - O objeto User contendo os interesses do usuário atualmente logado.
 * @returns {Promise<object|null>} Um objeto completo do post pronto para exibição no feed, ou null em caso de erro
 */
export async function prepararPostParaFeed(usuarioLogado) {
    // Validação inicial para garantir que temos um usuário e interesses
    if (!usuarioLogado || !usuarioLogado.getInterests || usuarioLogado.getInterests().length === 0) {
        console.error("Erro: Objeto de usuário logado ou lista de interesses está inválida/vazia.");
        return null;
    }

    const interessesDoUsuario = usuarioLogado.getInterests();
    console.log("Iniciando preparação do post com base nos interesses:", interessesDoUsuario);

    try {
        // Controle de Taxa: Aplica um atraso para não sobrecarregar o servidor/API free
        const agora = Date.now();
        const tempoDesdeUltimaRequisicao = agora - ultimoTempoRequisicao;
        if (tempoDesdeUltimaRequisicao < TEMPO_CONTROLE_REQUISICOES_MS) {
            const tempoDeEspera = TEMPO_CONTROLE_REQUISICOES_MS - tempoDesdeUltimaRequisicao;
            console.log(`Aguardando ${tempoDeEspera}ms para respeitar o limite de taxa.`);
            await atrasar(tempoDeEspera);
        }
        ultimoTempoRequisicao = Date.now(); // Atualiza o timestamp da última requisição

        // Realiza as requisições para o conteúdo do post e dados do usuário fictício em paralelo
        const [resultadoConteudoPost, resultadoDadosUsuario] = await Promise.all([
            requisitarConteudoPost(interessesDoUsuario), // Conteúdo e hashtags do post
            requisitarDadosUsuarioFicticio()           // Dados do usuário fictício (nome, email, senha)
        ]);

        const [conteudoPost, hashtagsArray] = resultadoConteudoPost;

        // verificando se ambos os resultados não são nulos e têm os campos esperados
        if (!conteudoPost || !resultadoDadosUsuario || !resultadoDadosUsuario.nome) {
            console.error("Dados iniciais (conteúdo do post ou dados do usuário fictício) incompletos/inválidos:", { conteudo: conteudoPost, dadosUsuario: resultadoDadosUsuario });
            return null; // Retorna nulo para que o feed não exiba um post incompleto
        }
        //solicitando imagem do perfil
        const urlAvatar = await requisitarImagemPerfil(resultadoDadosUsuario.nome);

        // Se a imagem do avatar não pôde ser gerada, usamos um avatar padrão
        if (!urlAvatar) {
            console.warn(`Não foi possível obter imagem para o usuário "${resultadoDadosUsuario.nome}". Usando avatar padrão.`);
            const idAvatarPadrao = Math.floor(Math.random() * 70) + 1; // ID aleatório entre 1 e 70 para i.pravatar.cc
            return {
                nomeUsuario: resultadoDadosUsuario.nome,
                avatarUrl: `https://i.pravatar.cc/150?img=${idAvatarPadrao}`, // Avatar de fallback
                conteudo: conteudoPost,
                hashtags: hashtagsArray.map(tag => `#${tag.replace(/\s/g, '_')}`).join(' ') // Formata hashtags
            };
        }

        // Retorna o objeto final do post completo para ser exibido no feed
        return {
            nomeUsuario: resultadoDadosUsuario.nome,
            avatarUrl: urlAvatar, // URL da imagem de perfil gerada
            conteudo: conteudoPost,
            hashtags: hashtagsArray.map(tag => `#${tag.replace(/\s/g, '_')}`).join(' ') // Formata hashtags
        };
    } catch (erro) {
        console.error("Erro crítico ao preparar post para o feed (catch principal):", erro.message || erro);
        return null;
    }
}