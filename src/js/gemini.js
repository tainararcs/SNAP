/* Gera o conteúdo para um post utilizando a API Gemini (versão: gemini-2.5-flash-lite-preview-06-17). 

    Uma lista de interesses (hashtags) pode ou não ser passada como parâmetro. 
    Se uma lista for fornecida, o modelo irá criar uma postagem baseada nos interesses contidos nesta lista.
    Caso nenhuma lista ou uma lista vazia seja fornecida, o modelo irá criar o post e uma lista de interesses associados.

    - apiKey: uma chave de API do Gemini.
    - interessesPredefinidos: lista de interesses.

    Em caso de sucesso, retorna um array com dois elementos, sendo o primeiro uma string que representa o conteúdo,
    e o segundo um array de strings que representa os interesses associados ao post. Em caso de erro, retorna null 
    e a lista de interesses vazia, ou com os interesses passados como parâmetro, respectivamente.

    Exemplos de uso:

        const [texto, interesses] = await requisitarPost(apiKey, ["#tecnologia", "#games"])
        const [texto, interesses] = await requisitarPost(apiKey)

    OBS: Esta é uma função assíncrona, seu retorno é uma Promise. É necessário usar await para obter o valor de retorno correto.
*/
async function requisitarPost(apiKey, interessesPredefinidos = null) {

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key=' + apiKey;

    let prompt = 'Crie um post pequeno e aleatório para uma rede social. Este post não deve conter nenhuma hashtag em seu corpo.\n';

    // Verifica se uma lista de interesses foi passada como parâmetro.
    if(Array.isArray(interessesPredefinidos) && interessesPredefinidos.length > 0){
       
        // Adiciona os interesses fornecidos ao prompt.
        prompt += 'Baseado na seguinte lista de interesses: ';
        
        for(let i = 0; i < interessesPredefinidos.length; i++){
            
            prompt += `"${interessesPredefinidos[i]}"`;

            if(i < interessesPredefinidos.length - 1){
                prompt += ', ';
            }
            else{
                prompt += '.\n';
            }
        }

    }
    else{ // Nenhuma lista válida passada como parâmetro.
        // Solicita que o Gemini gere os interesses para o post.
        prompt += '- Determine de 1 a 5 interesses relacionados ao conteúdo textual deste post. Gere uma lista contendo estes interesses, que devem ser representados como hashtags (obrigatóriamente precedidos por #).\n';
    }
    
    // Especifica o formato esperado da resposta.
    if(Array.isArray(interessesPredefinidos) && interessesPredefinidos.length > 0){ // Lista de interesses passada como parâmetro.
        prompt += 'O retorno deve estar no formato JSON: {"texto": "..." }';
    }
    else{ // Lista de interesses gerada pelo Gemini.
        prompt += 'O retorno deve seguir o formato JSON: {"texto": "...", "interesses": ["...", "..."] }';
    }

    console.log(prompt); // Para debug (exibe o prompt no console).

    // Define o corpo da requisição a ser feita.
    const body = {
        contents: [{ parts: [{ text: prompt }] }] // Adiciona o prompt criado.
    };

    // Envia o prompt para o Gemini.
    const response = await fetch(url, { // Realiza uma requisição HTTP para a url.
        method: 'POST', // Envio de dados.
        headers: { // O corpo da requisição será no formato JSON.
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body) // Converte para uma string JSON.
    });

    /* Obtém a resposta do Gemini. 
        A resposta estará em JSON, então é necessário que ela seja tranformada em um objeto JavaScript.
    */
    const data = await response.json();

    // Trata a resposta recebida.
    try{

        /* A resposta obtida é composta por uma lista de candidates que representam "candidatos" a respostas que foram geradas.
            O conteúdo então é composto por uma lista de partes, que contém o texto gerado.
        */
        const content = data.candidates[0].content.parts[0].text;
        // Buscar um bloco no formato JSON dentro do texto.
        const jsonMatch = content.match(/{[\s\S]*}/); // regex que não entendi
        
        if(!jsonMatch)
            throw new Error("Resposta fora do formato esperado.");

        // Converte o texto JSON em um objeto JavaScript.
        const post = JSON.parse(jsonMatch[0]);

        // Atribui o texto da resposta ou null.
        const texto = post.texto || null; 

        /* Se algum interesse tiver sido passado como parâmetro, atribui eles.
            Caso contrário, atribui os interesses fornecidos pelo Gemini, ou null. 
        */
        const interesses = interessesPredefinidos && interessesPredefinidos.length > 0 ? interessesPredefinidos : (post.interesses || []);

        return [texto, interesses];

    }catch(error){ // Se ocorrer algum erro.

        console.error("Erro ao interpretar a resposta:", error);
        console.log("Resposta recebida:", data);

        return [null, interessesPredefinidos || []];
    }
}