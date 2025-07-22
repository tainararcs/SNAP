document.addEventListener('DOMContentLoaded', () => {
    const MAX_INTERESTS = 5;
    const MIN_INTERESTS_TO_PROCEED = 3;
    const DEFAULT_SUGGESTIONS_COUNT = 10;

    const listaGemini = [
        "Séries", "História", "Inteligência Artificial", "Astronomia", "Música",
        "Tecnologia", "Natureza", "Jogos", "Cinema", "Fotografia",
        "Literatura", "Física", "Robótica", "Desenvolvimento Pessoal", "Artes", "Paisagens",
        "Culinária", "Viagens", "Fitness", "Moda", "Esportes",
        "Idiomas", "Finanças Pessoais", "Programação", "Design Gráfico", "Marketing Digital",
        "Psicologia", "Sociologia", "Filosofia", "Dança", "Teatro",
        "Meio Ambiente", "Voluntariado", "Empreendedorismo", "Criptomoedas", "Realidade Virtual",
        "Neurociência", "Cultura Pop", "Geografia", "Escrita Criativa", "Meditação",
        "Jardinagem", "Animais de Estimação", "Carros", "Motocicletas"
    ];

    let user = JSON.parse(localStorage.getItem('user')) || {};
    let interestsArray = [];
    let defaultRecommendations = [];

    // Elementos DOM
    const interestInput = document.getElementById('interests-input');
    const suggestionsOptions = document.getElementById('suggestion');
    const tagsDiv = document.getElementById('tag');
    const defaultTagsDiv = document.getElementById('default-tags');
    const advanceDesktop = document.getElementById('advance-desktop');
    const advanceMobile = document.getElementById('advance-mobile');

    // Carregando tema
    if (user.theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // Inicialização
    initDefaultRecommendations();
    loadDefaultRecommendations();

    // Oculta os botões "Avançar" inicialmente
    advanceDesktop.style.display = 'none';
    advanceMobile.style.display = 'none';

    // Mostrar sugestões ao focar no input
    interestInput.addEventListener('focus', () => {
        if (interestInput.value.length > 0) {
            showSuggestions(interestInput.value);
        }
    });

    // Evento de input para mostrar sugestões
    interestInput.addEventListener('input', () => {
        const text = interestInput.value.toLowerCase();
        if (text.length > 0) {
            showSuggestions(text);
        } else {
            toggleSuggestions(false);
        }
    });

    // Evento para adicionar com Enter
    interestInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addInterest();
        }
    });

    // Evento para adicionar com clique no ícone +
    document.querySelector('.add-icon').addEventListener('click', () => {
        addInterest();
    });

    // Fecha sugestões ao clicar fora
    document.addEventListener('click', (e) => {
        if (!interestInput.contains(e.target) && !suggestionsOptions.contains(e.target)) {
            toggleSuggestions(false);
        }
    });

    // Função para inicializar as recomendações padrão (10 aleatórias)
    function initDefaultRecommendations() {
        // Embaralha a lista e pega os 10 primeiros
        const shuffled = [...listaGemini].sort(() => 0.5 - Math.random());
        defaultRecommendations = shuffled.slice(0, DEFAULT_SUGGESTIONS_COUNT);
    }

    // Carrega as recomendações padrão na tela
    function loadDefaultRecommendations() {
    defaultTagsDiv.innerHTML = '';

    const availableRecommendations = defaultRecommendations.filter(
        item => !interestsArray.includes(item)
    );

    availableRecommendations.slice(0, 10).forEach(item => {
        const tag = document.createElement('span');
        tag.className = 'tag recommended-tag';
        tag.textContent = item;
        tag.onclick = () => addInterest(item);
        defaultTagsDiv.appendChild(tag);
    });
}

    // Função unificada do botão Avançar
    function handleAdvanceClick() {
        if (interestsArray.length >= MIN_INTERESTS_TO_PROCEED) {
            user.interests = interestsArray;
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = "feed.html";
        } else {
            showAlert("Escolha pelo menos 3 interesses antes de avançar.");
        }
    }

    advanceDesktop.addEventListener('click', handleAdvanceClick);
    advanceMobile.addEventListener('click', handleAdvanceClick);

    // Mostra/oculta sugestões
    function toggleSuggestions(show) {
        suggestionsOptions.style.display = show ? 'block' : 'none';
    }

    // Mostra sugestões baseadas no texto digitado
    function showSuggestions(text) {
        suggestionsOptions.innerHTML = '';
        
        const matchingInterests = listaGemini.filter(i =>
            i.toLowerCase().includes(text.toLowerCase()) && !interestsArray.includes(i)
        );

        if (matchingInterests.length > 0) {
            matchingInterests.forEach(item => {
                const div = document.createElement('div');
                div.textContent = item;
                div.onclick = () => addInterest(item);
                suggestionsOptions.appendChild(div);
            });
            toggleSuggestions(true);
        } else {
            toggleSuggestions(false);
        }
    }

    // Mostra alerta personalizado
    function showAlert(message) {
        $('#alertMessage').text(message);
        $('#alertModal').modal('show');
    }

    // Adiciona interesse
    function addInterest(value) {
        const newInterest = (value || interestInput.value.trim()).trim();

        if (!newInterest) return;

        if (listaGemini.includes(newInterest)) {
            if (!interestsArray.includes(newInterest)) {
                if (interestsArray.length < MAX_INTERESTS) {
                    interestsArray.push(newInterest);
                    updateTags();
                    interestInput.value = '';
                    toggleSuggestions(false);
                    loadDefaultRecommendations();
                } else {
                    showAlert(`Você pode adicionar no máximo ${MAX_INTERESTS} interesses.`);
                }
            } else {
                showAlert("Este interesse já foi adicionado.");
            }
        } else {
            showAlert("Por favor, selecione um interesse válido da lista.");
        }
    }

    // Remove interesse
    function removeInterest(interestToRemove) {
        interestsArray = interestsArray.filter(i => i !== interestToRemove);
        updateTags();
        loadDefaultRecommendations();
    }

    // Atualiza exibição das tags e botões
    function updateTags() {
        tagsDiv.innerHTML = '';

        interestsArray.forEach(interest => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.innerHTML = `${interest} <span class="remove-tag">X</span>`;
            span.onclick = (e) => {
                if (e.target.classList.contains('remove-tag')) {
                    removeInterest(interest);
                }
            };
            tagsDiv.appendChild(span);
        });

        // Mostra/oculta botões de avançar conforme necessário
        const shouldShowAdvance = interestsArray.length >= MIN_INTERESTS_TO_PROCEED;
        const isMobile = window.innerWidth <= 768;

        advanceDesktop.style.display = shouldShowAdvance && !isMobile ? 'inline-block' : 'none';
        advanceMobile.style.display = shouldShowAdvance && isMobile ? 'inline-block' : 'none';
    }
});