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

    OBS: Esta é uma função assíncrona, seu retorno é uma Promise. É necessário usar await para obter o valor de retorno correto.
*/
export async function requisitarPost(interessesPredefinidos = null) {
    
    try{

        // Chama o servidor backend Node.js (rodando localmente), para solicitar uma postagem.
        const response = await fetch('http://localhost:3001/requisitarPost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interesses: interessesPredefinidos || [] })
        });

        // Converte a resposta de JSON para um objeto JavaScript.
        const data = await response.json();
        return [data.texto, data.interesses];

    } catch(error){ // Em caso de erro
        console.error('Erro ao obter post:', error);
        return [null, interessesPredefinidos || []];
    }
}