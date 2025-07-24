const reqLink = "https://gemini-api-requests.onrender.com";

/* Gera o conteúdo para um post. Faz uma requisição para o servidor, que utiliza internamente a API Gemini. 

    Uma lista de interesses (hashtags) pode ou não ser passada como parâmetro. 
    Se uma lista for fornecida, o modelo irá criar uma postagem baseada nos interesses contidos nesta lista.
    Caso nenhuma lista ou uma lista vazia seja fornecida, o modelo irá criar um post e uma lista de interesses associados, ambos aleatórios.

    - interessesPredefinidos: lista de interesses.

    Em caso de sucesso, retorna um array com dois elementos, sendo o primeiro uma string que representa o conteúdo,
    e o segundo um array de strings que representa os interesses associados ao post. Em caso de erro, retorna null 
    e a lista de interesses vazia, ou com os interesses passados como parâmetro, respectivamente.

    Exemplos de uso:

        const [texto, interesses] = await requisitarPost(["#tecnologia", "#games"])
        const [textoAleatorio, interessesAleatorios] = await requisitarPost()

    OBS: Esta é uma função assíncrona, seu retorno é uma Promise. É necessário usar await para obter o valor de retorno corretamente.
*/
export async function requisitarPost(interessesPredefinidos = null) {
    
    try{

        // Chama o servidor backend Node.js, para solicitar uma postagem.
        const response = await fetch(`${reqLink}/requisitarPost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interesses: interessesPredefinidos || [] })
        });

        // Converte a resposta de JSON para um objeto JavaScript.
        const content = await response.json();
        return [content.texto, content.interesses];

    } catch(error){ // Em caso de erro
        console.error('Erro ao obter post:', error);
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
export async function requisitarBioUsuarioF(interesses = [], nome = {}) {
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
