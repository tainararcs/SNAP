const reqLink = "https://gemini-api-requests.onrender.com";
//const reqLink = "http://localhost:3001";

/* Gera conteúdo textual (post ou biografia) para um usuário fictício. Faz uma requisição para o servidor, que utiliza internamente a API Gemini. 

    Parâmetros:
    - interessesPredefinidos: lista de interesses (hashtags) que pode ser fornecida para direcionar o conteúdo. 
        Se uma lista for fornecida, o modelo irá criar o conteúdo baseado em pelo menos um desses interesses.
        Caso nenhuma lista ou uma lista vazia seja fornecida, o modelo irá criar conteúdo e interesses associados aleatoriamente.
    - gerarBio: booleano opcional (padrão: false). Se true, gera uma biografia de perfil; se false, gera um post.
    - nome: string opcional (padrão: ""). Nome do usuário, usado apenas quando gerarBio=true para personalizar a biografia.

    Retorno:
    Em caso de sucesso, retorna um array com dois elementos:
        [0]: string com o conteúdo textual (post ou biografia)
        [1]: array de strings com os interesses (hashtags) associados ao conteúdo gerado.
    Em caso de erro, retorna [null, interessesPredefinidos || []] 

    Exemplos de uso:

        // Gerar um post com base em interesses
        const [post, interessesPost] = await requisitarPost(["#tecnologia", "#games"]);
        
        // Gerar um post aleatório
        const [postAleatorio, interessesAleatorios] = await requisitarPost();
        
        // Gerar uma biografia com base em interesses e nome
        const [bio, interessesBio] = await requisitarPost(["#música", "#viagem"], true, "Ana Silva");
        
        // Gerar uma biografia aleatória
        const [bioAleatoria, interessesBio] = await requisitarPost([], true);

    OBS: Esta é uma função assíncrona, seu retorno é uma Promise. É necessário usar await para obter o valor de retorno corretamente.
*/
export async function requisitarPost(interessesPredefinidos = null, gerarBio = false, nome = "") {
    try {
        const response = await fetch(`${reqLink}/requisitarPost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                interesses: interessesPredefinidos || [],
                gerarBio,
                nome
            })
        });

        const content = await response.json();
        return [content.texto, content.interesses];
    } catch (error) {
        console.error('Erro ao obter conteúdo:', error);
        return [null, interessesPredefinidos || []];
    }
} // function requisitarPost


/* Gera dados para um usuário fictícios. Faz uma requisição para o servidor, que utiliza internamente a API Gemini. 
    Em caso de sucesso retorna um objeto Java Script com os seguintes campos: 
    
    - id, nome, email, senha

    Em caso de erro, retorna somente null.
    Exemplo de uso: 

        const [user] = await requisitarUserData();
        console.log(data.id);
        console.log(data.nome);
        console.log(data.email);
        console.log(data.senha);

    OBS: Esta é uma função assíncrona, seu retorno é uma Promise. É necessário usar await para obter o valor de retorno corretamente.
*/
export async function requisitarUserData() {
    
    try{

        // Chama o servidor backend Node.js, para solicitar dados para um usuário fictício.
        const response = await fetch(`${reqLink}/requisitarUserData`, {
            method: 'GET',
        });

        // Converte a resposta de JSON para um objeto JavaScript.
        const data = await response.json();

        return data;

    } catch(error){ // Em caso de erro
        console.error('Erro ao obter dados:', error);
        return null;
    }
} // function requisitarUserData


/* Gera uma imagem de perfil baseada em um nome de usuário. Faz uma requisição para o servidor, que utiliza internamente a API Gemini. 

    Retorna a url, fornecida pelo servidor, para acesso a imagem em caso de sucesso.
    Caso ocorra algum erro, retorna a url para uma imagem de usuário "default".

    Exemplo de uso:

        const url = await requisitarImagemPerfil("Rafael");

    OBS: Esta é uma função assíncrona, seu retorno é uma Promise. É necessário usar await para obter o valor de retorno corretamente.
*/
export async function requisitarImagemPerfil (username) {
    
    try{

        // Chama o servidor backend Node.js, para solicitar uma imagem de um usuário fictício.
        const response = await fetch(`${reqLink}/requisitarImagemPerfil`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: username
        });

        // Monta a url para acessar a imagem.
        const imageUrl =  `${reqLink}/` + await response.text();
        
        return imageUrl;

    } catch(error){ // Em caso de erro
        console.error('Erro ao obter imagem:', error);
        return `${reqLink}/default.png`;
    }
} // function requisitarImagemPerfil

/* Gera uma bio de usuário fictício com base em interesses, usando a API Gemini.
   Retorna uma string com o texto da bio ou null em caso de erro.

   Exemplo:
   const bio = await requisitarBioUsuarioF(["#moda", "#viagem"]);
*/
export async function requisitarBioUsuarioF(interesses = [], nome = "") {
    try {
        const response = await fetch(`${reqLink}/requisitarBioUsuarioF`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interesses, nome })
        });

        const data = await response.json();
        return data.texto || null;
    } catch (error) {
        console.error('Erro ao gerar bio:', error);
        return null;
    }
}
