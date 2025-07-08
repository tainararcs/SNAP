import { GoogleGenerativeAI } from '@google/generative-ai';

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors()); 
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/requisitarPost', async (req, res) => {

    const interessesPredefinidos = req.body.interesses || [];

    let prompt = 'Crie um post pequeno e aleatório para uma rede social. Este post não deve conter nenhuma hashtag em seu corpo.\n';

    if(interessesPredefinidos.length > 0){
        prompt += 'Baseado na seguinte lista de interesses: ';
        prompt += interessesPredefinidos.map(i => `"${i}"`).join(', ') + '.\n';
    }
    else{
        prompt += '- Determine de 1 a 5 interesses relacionados ao conteúdo textual deste post. Gere uma lista contendo estes interesses, que devem ser representados como hashtags (obrigatoriamente precedidos por #).\n';
    }

    prompt += interessesPredefinidos.length > 0
        ? 'O retorno deve estar no formato JSON: {"texto": "..."}'
        : 'O retorno deve estar no formato JSON: {"texto": "...", "interesses": ["...", "..."] }';

    try{
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite-preview-06-17'
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/{[\s\S]*}/);

        if(!jsonMatch)
            throw new Error('Resposta fora do formato esperado.');

        const post = JSON.parse(jsonMatch[0]);
        const texto = post.texto || null;
        const interesses = interessesPredefinidos.length > 0 ? interessesPredefinidos : (post.interesses || []);

        res.json({ texto, interesses });

    } catch(error){
        console.error('Erro:', error);
        res.status(500).json({ texto: null, interesses: interessesPredefinidos || [] });
    }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});