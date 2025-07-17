document.addEventListener('DOMContentLoaded', () => {
    const MAX_INTERESTS = 5;
    const MIN_INTERESTS_TO_PROCEED = 3;

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

    let interestsArray = [];

    const interestInput = document.getElementById('interests-input');
    const suggestionsOptions = document.getElementById('suggestion');
    const tagsDiv = document.getElementById('tag');
    const advanceDesktop = document.getElementById('advance-desktop');
    const advanceMobile = document.getElementById('advance-mobile');

    // Oculta os botões "Avançar" inicialmente
    advanceDesktop.style.display = 'none';
    advanceMobile.style.display = 'none';

    // Mostrar sugestões ao focar no input
    interestInput.addEventListener('focus', () => {
        if (interestInput.value.length > 0) {
            toggleSuggestions(true);
        }
    });

    // Evento de input para mostrar sugestões
    interestInput.addEventListener('input', () => {
        const text = interestInput.value.toLowerCase();
        suggestionsOptions.innerHTML = '';

        if (text.length > 0) {
            const matchingInterests = listaGemini.filter(i =>
                i.toLowerCase().includes(text) && !interestsArray.includes(i)
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

    // Fecha sugestões ao clicar fora
    document.addEventListener('click', (e) => {
        if (!interestInput.contains(e.target) && !suggestionsOptions.contains(e.target)) {
            toggleSuggestions(false);
        }
    });

    // Função unificada do botão Avançar
    function handleAdvanceClick() {
        if (interestsArray.length >= MIN_INTERESTS_TO_PROCEED) {
            let user = JSON.parse(localStorage.getItem('user')) || {};
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

    // Mostra alerta personalizado
    function showAlert(message) {
        $('#alertMessage').text(message);
        $('#alertModal').modal('show');
    }

    // Adiciona interesse
    function addInterest(value) {
        const newInterest = value || interestInput.value.trim();

        if (newInterest && listaGemini.includes(newInterest) && !interestsArray.includes(newInterest)) {
            if (interestsArray.length < MAX_INTERESTS) {
                interestsArray.push(newInterest);
                updateTags();
                interestInput.value = '';
                toggleSuggestions(false);
            } else {
                showAlert("Você pode adicionar no máximo 5 interesses.");
            }
        }
    }

    // Remove interesse
    function removeInterest(interesseRemover) {
        interestsArray = interestsArray.filter(i => i !== interesseRemover);
        updateTags();
    }

    // Atualiza exibição das tags e botões
    function updateTags() {
        tagsDiv.innerHTML = '';

        interestsArray.forEach(i => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.innerHTML = `${i} <span class="remove-tag">×</span>`;
            span.onclick = (e) => {
                if (e.target.classList.contains('remove-tag')) {
                    removeInterest(i);
                }
            };
            tagsDiv.appendChild(span);
        });

        // Verifica se é tela mobile
        const isMobile = window.innerWidth <= 768;

        // Mostra apenas o botão da plataforma atual
        if (interestsArray.length >= MIN_INTERESTS_TO_PROCEED) {
            if (isMobile) {
                advanceMobile.style.display = 'inline-block';
                advanceDesktop.style.display = 'none';
            } else {
                advanceDesktop.style.display = 'inline-block';
                advanceMobile.style.display = 'none';
            }
        } else {
            advanceDesktop.style.display = 'none';
            advanceMobile.style.display = 'none';
        }
    }
});
