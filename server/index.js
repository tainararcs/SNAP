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


// Rota POST para requisitarPost. 
app.post('/requisitarPost', async (req, res) => {
    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_KEY1});
    const { interesses = [], gerarBio = false, nome = "" } = req.body;

    let prompt;
    //Verifica se há uma requisição de bio a ser criada.
    if (gerarBio) {
        prompt = 'Crie uma biográfia de um usuário fictício para uma rede social, como se fosse um jovem da geração Z. A bio deve conter no máximo 100 caracteres!';
        if (nome) {
            prompt += ` O nome do usuário é "${nome}", use pronomes adequados. Na bio, não inclua o nome do usuário.`;
        }
        prompt += ' Baseie-se nos interesses do usuário. Não inclua hashtags.\n';
    } else {
        prompt = 'Crie um post pequeno e aleatório para uma rede social, como se fosse um jovem da geração Z. Evite iniciar de forma genérica. Não inclua hashtags no corpo.\n';
    }

    // Verifica se há interesses pré-definidos.
    if (interesses.length > 0) {
        prompt += 'Baseado em pelo menos um destes interesses: ';
        prompt += interesses.map(i => `"${i}"`).join(', ') + '.\n';
    }

    if (!gerarBio) {
        prompt += '- Determine de 1 a 5 interesses relacionados (como hashtags, começando com "#" e sem espaços, exemplo: #Jardinagem).\n';
    }

    // Especifica o formato esperado da resposta.
    prompt += 'Retorne SOMENTE no formato JSON: {"texto": "...", "interesses": ["...", "..."] }';

    try {
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt
        }); // Obtém resposta.

        const text = response.text; // Extrai o conteúdo como texto.
        const jsonMatch = text.match(/{[\s\S]*}/);

        if (!jsonMatch) 
            throw new Error('Resposta fora do formato esperado.');


        // Converte o texto JSON em um objeto JavaScript.
        const result = JSON.parse(jsonMatch[0]);

        // Responde em formato JSON.
        res.json({ 
            texto: result.texto || null, // Atribui o texto da resposta ou null.
            interesses: result.interesses || [] 
        });
    } catch (error) { // Em caso de erro.
        console.error('Erro:', error);
        res.status(500).json({ 
            texto: null, 
            interesses: interesses 
        });
    }
});

// Rota POST para requisitarUserData. 
app.get('/requisitarUserData', async (req, res) => {   

    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_KEY2});

    const categorias = [
        "um cientista famoso do século XX",
        "um personagem de um videogame de RPG japonês",
        "um pintor do período renascentista",
        "uma figura da mitologia grega",
        "um diretor de cinema de Hollywood dos anos 80",
        "um atleta olímpico medalhista de ouro",
        "um vilão de um livro de fantasia",
        "uma celebridade",
        "um personagem fictício",
        "um explorador histórico",
        "um inventor do século XIX",
        "um líder revolucionário",
        "um personagem de anime",
        "um astronauta da era espacial",
        "um filósofo da Grécia Antiga",
        "um mago de histórias de fantasia",
        "um herói de histórias em quadrinhos",
        "um músico do século XX",
        "um monarca europeu do período medieval",
        "um personagem de ficção científica",
        "um protagonista ou personagem de um jogo",
        "uma IA",
        "um robô da ficção",
        "um elemento da natureza",
        "um conceito abstrato",
        "um termo científico (ex: Entropia, Neutrino, Singularidade)",
        "uma constelação ou astro",
        "um mineral",
        "uma criatura mítica",
        "um termo antigo",
        "um artefato mágico fictício",
        "um termo em latim",
        "uma planta",
        "um cientista",
        "um personagem de ficção científica",
        "um vilão de quadrinhos",
        "um escritor clássico",
        "um filósofo",
        "uum personagem de anime",
        "um super-herói ou anti-herói",
        "um artista moderno",
        "um hacker fictício",
        "um engenheiro famoso",
        "um diretor de cinema",
    ];

    const categoriaPrimeiroNome = categorias[Math.floor(Math.random() * categorias.length)];
    const categoriaSobrenome = categorias[Math.floor(Math.random() * categorias.length)];

    // Agora, construa o prompt:
    let prompt = `
        Crie dados para um usuário de uma rede social. Siga estritamente estas regras:
        1.  Primeiro Nome: Escolha o nome de ${categoriaPrimeiroNome}.
        2.  Segundo Nome: Escolha ${categoriaSobrenome}.
        3.  Nome de Usuário Final: Junte o Primeiro e o Segundo Nome, sem espaços e em CamelCase (ex: "HulkNewtonQuasar").
        4.  Email: Crie um email baseado no nome de usuário gerado.
        5.  Senha: Crie uma senha forte com 12 caracteres aleatórios.

        Formate a saída exatamente como no exemplo abaixo, em JSON, sem texto adicional.

        Exemplo de Saída:
        {
            "nome": "MarieCuriePulsar",
            "email": "marie.curie.pulsar@emailaleatorio.com",
            "senha": "aK3!pZ$tG9@v"
        }
    `

    try{
    
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-lite',
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
    
    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_KEY3});

    const username = req.body;
    const prompt = `Crie uma imagem de uma pessoa com traços aleatórios baseando-se no nome fictício: ${username}. A resposta deve conter apenas uma imagem, sem qualquer texto.`

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
  console.log(`Servidor rodando na porta ${PORT}`);
});
