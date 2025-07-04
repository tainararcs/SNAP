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

let interesses = [];

const interesse = document.getElementById('intrests-input');
const sugestoes = document.getElementById('suggestion');
const tagsDiv = document.getElementById('tag');
const avancar = document.getElementById('advance');
const botaoAdd = document.querySelector('.add');

// Função para mostrar alerta personalizado
function showAlert(message) {
    $('#alertMessage').text(message);
    $('#alertModal').modal('show');
}

// Mostrar sugestões ao focar no input
interesse.addEventListener('focus', () => {
    if (interesse.value.length > 0) {
        toggleSugestoes(true);
    }
});

// Oculta o botão "Avançar" inicialmente
avancar.style.display = 'none';

// Mostra/oculta sugestões
function toggleSugestoes(show) {
    sugestoes.style.display = show ? 'block' : 'none';
}

// Adiciona interesse
function adicionarInteresse(valor) {
    const interesseValor = valor || interesse.value.trim();

    if (interesseValor && listaGemini.includes(interesseValor) && !interesses.includes(interesseValor)) {
        if (interesses.length < 5) {
            interesses.push(interesseValor);
            atualizarTags();
            interesse.value = '';
            toggleSugestoes(false);
        } else {
            showAlert("Você pode adicionar no máximo 5 interesses.");
        }
    }
}

// Remove interesse
function removerInteresse(interesseRemover) {
    interesses = interesses.filter(i => i !== interesseRemover);
    atualizarTags();
}

// Atualiza a exibição das tags
function atualizarTags() {
    tagsDiv.innerHTML = '';
    interesses.forEach(i => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.innerHTML = `${i} <span class="remove-tag">×</span>`;
        span.onclick = (e) => {
            if (e.target.classList.contains('remove-tag')) {
                removerInteresse(i);
            }
        };
        tagsDiv.appendChild(span);
    });

    // Mostrar o botão "Avançar" somente se houver 3 ou mais interesses
    avancar.style.display = interesses.length >= 3 ? 'inline-block' : 'none';
}

// Evento de input para mostrar sugestões
interesse.addEventListener('input', () => {
    const texto = interesse.value.toLowerCase();
    sugestoes.innerHTML = '';

    if (texto.length > 0) {
        const filtradas = listaGemini.filter(i =>
            i.toLowerCase().includes(texto) && !interesses.includes(i)
        );

        if (filtradas.length > 0) {
            filtradas.forEach(item => {
                const div = document.createElement('div');
                div.textContent = item;
                div.onclick = () => adicionarInteresse(item);
                sugestoes.appendChild(div);
            });
            toggleSugestoes(true);
        } else {
            toggleSugestoes(false);
        }
    } else {
        toggleSugestoes(false);
    }
});

// Evento para adicionar com Enter ou botão +
interesse.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        adicionarInteresse();
    }
});

botaoAdd.addEventListener('click', (e) => {
    e.preventDefault();
    adicionarInteresse();
});

// Fecha sugestões ao clicar fora
document.addEventListener('click', (e) => {
    if (!interesse.contains(e.target) && !sugestoes.contains(e.target)) {
        toggleSugestoes(false);
    }
});

// Evento do botão avançar
avancar.addEventListener('click', () => {
    if (interesses.length >= 3) {
        localStorage.setItem('interessesEscolhidos', JSON.stringify(interesses));
        window.location.href = "feed.html";
    } else {
        showAlert("Escolha pelo menos 3 interesses antes de avançar.");
    }
});