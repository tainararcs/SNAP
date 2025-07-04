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

// Seleciona o botão '+' e adiciona o evento de clique.
const botaoAdd = document.querySelector('.add');

// Oculta o botão "Avançar" inicialmente.
avancar.style.display = 'none';

interesse.addEventListener('input', () => {
    const texto = interesse.value.toLowerCase();
    sugestoes.innerHTML = '';

    if (texto.length > 0) {
        const filtradas = listaGemini.filter(i =>
            i.toLowerCase().includes(texto) && !interesses.includes(i)
        );

        filtradas.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item;
            div.onclick = () => {
                interesse.value = item;
                sugestoes.innerHTML = '';
            };
            sugestoes.appendChild(div);
        });
    }
});

avancar.addEventListener('click', () => {
    if (interesses.length >= 3) {
        // Armazena os interesses no localStorage.
        localStorage.setItem('interessesEscolhidos', JSON.stringify(interesses));

        // Redireciona para o feed.
        window.location.href = "feed.html";
    } 
    else {
        alert("Escolha pelo menos 3 interesses antes de avançar.");
    }
});

interesse.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        adicionarInteresse();
    }
});

function adicionarInteresse() {
    const valor = interesse.value.trim();

    if (valor && listaGemini.includes(valor) && !interesses.includes(valor)) {
        if (interesses.length < 5) {
            interesses.push(valor);
            atualizarTags();
            interesse.value = '';
            sugestoes.innerHTML = '';
        }
    }
}

botaoAdd.addEventListener('click', (e) => {
    e.preventDefault();
    adicionarInteresse();
});

function atualizarTags() {
    tagsDiv.innerHTML = '';
    interesses.forEach(i => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = i;
        tagsDiv.appendChild(span);
    });

    // Mostrar o botão "Avançar" somente se houver 3 ou mais interesses.
    avancar.style.display = interesses.length >= 3 ? 'inline-block' : 'none';
}