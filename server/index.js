import { GoogleGenAI, Modality } from "@google/genai";

import express from 'express'; // Criar servidor HTTP.
import cors from 'cors'; // Permitir requisições de outros domínios.
import bodyParser from 'body-parser'; // Transformar corpo de requisições em obj Javascript.
import dotenv from 'dotenv'; // Váriaveis de ambiente por meio de arquivos .env

import * as fs from "node:fs"; 

dotenv.config(); // Carrega a chave api do arquivo .env como variável de ambiente. 

const app = express(); 
const PORT = 3001; // Porta onde o servidor escutará requisições.

app.use(cors()); 
app.use(bodyParser.json()); 
app.use(express.text());
app.use('/img', express.static('public/img')); // Acesso as imagens armazenadas.

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Rota POST para requisitarPost. 
app.post('/requisitarPost', async (req, res) => {

    const interessesPredefinidos = req.body.interesses || [];

    let prompt = 'Crie um post pequeno e aleatório para uma rede social, como se fosse um jovem da geração Z. Evite iniciar de forma genérica como: Acabei de ... etc. Este post não deve conter nenhuma hashtag em seu corpo.\n';

    // Verifica se há interesses pré-definidos.
    if(interessesPredefinidos.length > 0){

        prompt += 'Baseado em pelo menos um interesses da seguinte lista de interesses: ';
        
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

    prompt += '- Determine de 1 a 5 interesses relacionados ao conteúdo textual deste post.';
    prompt += ' Gere uma lista contendo estes interesses, que devem ser representados como hashtags (obrigatoriamente precedidos por #).\n';

    // Especifica o formato esperado da resposta.
    prompt += 'O retorno deve estar somente no formato JSON: {"texto": "...", "interesses": ["...", "..."] }';

    try{
       
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-lite-preview-06-17',
            contents: prompt
        }); // Obtém resposta.
       
        const text = response.text; // Extrai o conteúdo como texto.

        // Busca um bloco no formato JSON dentro do texto.
        const jsonMatch = text.match(/{[\s\S]*}/);

        if(!jsonMatch)
            throw new Error('Resposta fora do formato esperado.');

        // Converte o texto JSON em um objeto JavaScript.
        const post = JSON.parse(jsonMatch[0]);

        // Atribui o texto da resposta ou null.
        const texto = post.texto || null;

        const interesses = post.interesses || [];

        res.json({ texto, interesses }); // Responde em formato JSON.

    } catch(error){ // Em caso de erro.
        console.error('Erro:', error);
        res.status(500).json({ texto: null, interesses: interessesPredefinidos || [] });
    }
});

// Rota POST para requisitarUserData. 
app.get('/requisitarUserData', async (req, res) => {

    let prompt = 'Crie dados para um usuário de uma rede social. Os dados gerados serão:\n - nome: um nome composto, sem espaços entre os nomes, cujo primeiro nome seja o nome de alguma celebridade aleatória, personagem fictício, nome popular, mistura de cada um, e o segundo nome aleatório idem.\n - email: relacionado ao nome do usuário.\n - senha: caracteres aleatórios \n';

    // Especifica o formato esperado da resposta.
    prompt += 'O retorno deve estar somente no formato JSON: {"nome": "Nome", "email": "email@email.com", "senha": "xxx"}';

    try{
    
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-lite-preview-06-17',
            contents: prompt,
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 2.0,  
                topP: 2.0,   
                topK: 100 
                // Valores mais elevados pois a criatividade do modelo para geração de nomes apresentou-se ruim.
            }
        }); // Obtém resposta.
       
        const text = response.text; // Extrai o conteúdo como texto.

        // Busca um bloco no formato JSON dentro do texto.
        const jsonMatch = text.match(/{[\s\S]*}/);

        if(!jsonMatch)
            throw new Error('Resposta fora do formato esperado.');

        // Converte o texto JSON em um objeto JavaScript.
        const userData = JSON.parse(jsonMatch[0]);

        res.json(userData); // Responde em formato JSON.

    } catch(error){ // Em caso de erro.
        console.error('Erro:', error);
        res.status(500).json({ error: 'Erro ao gerar dados do usuário.' });
    }
});

// Rota POST para requisitarImagemPerfil. 
app.post('/requisitarImagemPerfil', async (req, res) => {

    const username = req.body;
    const prompt = `Crie uma imagem 400x400 de uma pessoa com traços aleatórios baseando-se no nome fictício: ${username}. A resposta deve conter apenas uma imagem, sem qualquer texto.`

    try {

        const result = await genAI.models.generateContent({
            model: 'gemini-2.0-flash-preview-image-generation',
            contents: prompt,
            config: {
                responseModalities: [Modality.TEXT, Modality.IMAGE]
            }
        }); // Obtém resposta.

        // Encontra a primeira parte com imagem.
        const imagePart = result.candidates[0].content.parts.find(p => p.inlineData?.mimeType?.startsWith("image/"));

        if(!imagePart){
            throw new Error("Nenhuma imagem retornada.");
        }

        const imageData = imagePart.inlineData.data; // Obtém os dados da imagem codificados em base64.
        const buffer = Buffer.from(imageData, "base64"); // Converte os dados.
        const path = `public/img/${username}.png`; // Define o caminho onde a imagem será salva.

        // Salva a imagem gerada.
        fs.writeFileSync(path, buffer); 

        res.send(path);

    } catch(error){
        console.error("Erro:", error);
        res.status(500).send("Erro ao gerar ou salvar imagem.");
    }
});

// Inicia o servidor na porta especificada.
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});