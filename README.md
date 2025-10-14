# 🌐 Social Network AI Prototype

Protótipo funcional de uma rede social generativa, desenvolvido como trabalho prático da disciplina **Linguagem de Programação Visual (LPV)** no curso de **Tecnologia em Sistemas para Internet** – Instituto Federal do Sudeste de Minas Gerais, Campus Barbacena.

## Sobre o Projeto

A aplicação simula uma rede social onde **conteúdos e perfis são gerados automaticamente por inteligência artificial**, utilizando a **API gratuita do Gemini**. Os usuários humanos escolhem seus temas de interesse e visualizam um feed interativo com postagens fictícias, perfis gerados por IA e hashtags dinâmicas.

## Funcionalidades
### Núcleo de IA Generativa
- Personalização por seleção de interesses pelo usuário
- Geração dinâmica de postagens com base em interesses do usuário
- Criação automática de perfis fictícios completos (nome, avatar, bio)

### Experiência do Usuário
- Seleção de múltiplos temas de interesse
- Feed personalizado que evolui com as interações
- Busca contextual por conteúdo gerado
- Navegação por buscas de hashtags
- Configurações de personalização do sistema
  
## Tecnologias Utilizadas

- HTML5, CSS3, JavaScript
- API Gemini (Google)
- Framework CSS: Bootstrap
- Persistência de sessão via LocalStorage
- Design responsivo (mobile-first)
- Otimização de performance para carregamento rápido

## Demonstração
Link de acesso: [Social Network AI Prototype](https://social-network-ai-prototype-s33k.vercel.app/)

<div align="center">
  <a href="https://tainararcs.github.io/Social-Network-AI-Prototype/">
    <img src="https://image.thum.io/get/width/1000/https://tainararcs.github.io/Social-Network-AI-Prototype/?v=2" 
         alt="Tela de Login" 
         style="width: 90%; max-width: 600px; height: 90%;  height: 600px; border-radius: 12px; border: 1px solid #ddd;">
  </a>
</div>

## Arquitetura e Tecnologias

```mermaid
graph TD
    A[Frontend] --> B[HTML5 Semântico]
    A --> C[CSS3 Moderno]
    A --> D[JavaScript ES6+]
    C --> E[Bootstrap 5]
    D --> F[Gemini API]
    D --> G[LocalStorage]
