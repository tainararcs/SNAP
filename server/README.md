
Após clonar o repositório, siga os passos abaixo:


## 🔑 Configuração da API

Dentro da pasta `server`, existe um arquivo `.env` de exemplo. Nele, você deve inserir sua chave da API Gemini:

```
GEMINI_API_KEY=sua_chave_aqui
```

## 📦 Instalação e Execução

Para instalar todas as dependências e iniciar o servidor automaticamente, use:

```bash
npm run setup
```

Ou, se as dependências já estiverem instaladas, apenas inicie o servidor com:

```bash
npm start
```



**⚠️ Importante:**  
- Nunca faça `git add` no arquivo `.env` com a chave preenchida.  
- Nunca adicione a pasta `node_modules` ao Git.
- Antes de executar o projeto, certifique-se de ter Node.js instalado.
