// Credenciais fixas
const USER = "admin";
const PASS = "1234";

// Voluntários
let voluntarios = [];

// Login
document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    if (usuario === USER && senha === PASS) {
        document.getElementById('login').classList.add('hidden');
        document.getElementById('main').classList.remove('hidden');
        showCadastro();
    } else {
        document.getElementById('loginError').textContent = "Usuário ou senha incorretos.";
    }
};

// Navegação
document.getElementById('menuCadastro').onclick = showCadastro;
document.getElementById('menuLista').onclick = showLista;

function showCadastro() {
    document.getElementById('cadastroVoluntario').classList.remove('hidden');
    document.getElementById('listaVoluntarios').classList.add('hidden');
}
function showLista() {
    document.getElementById('cadastroVoluntario').classList.add('hidden');
    document.getElementById('listaVoluntarios').classList.remove('hidden');
    renderLista();
}

// CEP consulta automática
document.getElementById('cep').addEventListener('blur', buscarEndereco);
document.getElementById('cep').addEventListener('input', function() {
    document.getElementById('endereco').textContent = '';
    document.getElementById('weatherDisplay').textContent = '';
});

function buscarEndereco() {
    const cep = document.getElementById('cep').value.trim();
    if (cep.length === 8 && /^\d{8}$/.test(cep)) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(data => {
                if (data.erro) {
                    document.getElementById('endereco').textContent = "CEP não encontrado.";
                    document.getElementById('weatherDisplay').textContent = '';
                    alert("CEP não encontrado.");
                } else {
                    const enderecoFormatado = `${data.logradouro || ''} ${data.bairro || ''} ${data.localidade || ''} - ${data.uf || ''}`;
                    document.getElementById('endereco').textContent = enderecoFormatado;
                    buscarClima(data.localidade);
                }
            })
            .catch(() => {
                document.getElementById('endereco').textContent = "Erro ao buscar endereço.";
                document.getElementById('weatherDisplay').textContent = '';
                alert("Erro ao buscar endereço.");
            });
    }
}

// Função para retornar emoji baseado na descrição do clima
function emojiDoClima(descricao) {
    if (!descricao) return '🌈';
    const desc = descricao.toLowerCase();
    if (desc.includes('sun') || desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('storm') || desc.includes('thunder')) return '⛈️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
    if (desc.includes('wind')) return '🌬️';
    return '🌈';
}

// Buscar clima
async function buscarClima(cidade) {
    const weatherDisplayDiv = document.getElementById('weatherDisplay');
    weatherDisplayDiv.textContent = 'Buscando clima...';
    weatherDisplayDiv.className = 'weather-info loading';

    try {
        const apiUrl = `https://goweather.herokuapp.com/weather/${encodeURIComponent(cidade)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data && data.temperature) {
            const emoji = emojiDoClima(data.description);
            weatherDisplayDiv.innerHTML = `
                <strong>Clima em ${cidade}:</strong> ${emoji}<br>
                Temperatura: ${data.temperature}<br>
                Vento: ${data.wind}<br>
                Descrição: ${data.description}
            `;
            weatherDisplayDiv.className = 'weather-info';
        } else {
            throw new Error("Não foi possível obter a previsão do tempo.");
        }
    } catch (error) {
        weatherDisplayDiv.textContent = "Erro ao buscar clima.";
        weatherDisplayDiv.className = 'weather-info error';
        alert("Erro ao buscar clima.");
    }
}

// Cadastro de voluntário (async para aguardar o clima)
document.getElementById('cadastroForm').onsubmit = async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const cep = document.getElementById('cep').value.trim();
    const endereco = document.getElementById('endereco').textContent;

    if (!nome || !email || !cep || !endereco || endereco.includes("CEP não encontrado") || endereco.includes("Erro")) {
        document.getElementById('cadastroMsg').style.color = 'red';
        document.getElementById('cadastroMsg').textContent = "Preencha todos os campos corretamente.";
        alert("Preencha todos os campos corretamente.");
        return;
    }

    const emailExistente = voluntarios.some(v => v.email.toLowerCase() === email.toLowerCase());
    if (emailExistente) {
        document.getElementById('cadastroMsg').style.color = 'red';
        document.getElementById('cadastroMsg').textContent = "Este email já está cadastrado.";
        alert("Este email já está cadastrado.");
        return;
    }

    // Aqui aguardamos o clima carregar antes de confirmar o cadastro
    try {
        // Extrai a cidade do endereço (assumindo formato "... cidade - UF")
        const cidade = endereco.split(' - ')[0].split(' ').slice(-1)[0] || endereco.split(' - ')[0];
        await buscarClima(cidade);
    } catch {
        // Erros já tratados dentro de buscarClima()
    }

    voluntarios.push({ nome, email, cep, endereco });
    document.getElementById('cadastroForm').reset();
    document.getElementById('endereco').textContent = '';
    document.getElementById('weatherDisplay').textContent = '';
    document.getElementById('cadastroMsg').style.color = 'green';
    document.getElementById('cadastroMsg').textContent = "Voluntário cadastrado com sucesso!";
    alert("Voluntário cadastrado com sucesso!");
};

// Lista de voluntários com imagem
function renderLista() {
    const tbody = document.getElementById('voluntariosBody');
    tbody.innerHTML = '';

    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😉', '😎', '😍', '🤩', '🥳', '🤗', '😇', '🤠', '😺', '🐱', '🐶'];

    voluntarios.forEach(v => {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-size: 2.5rem; text-align: center;">${emoji}</td>
            <td>${v.nome}</td>
            <td>${v.email}</td>
            <td>${v.cep}</td>
            <td>${v.endereco}</td>
        `;
        tbody.appendChild(tr);
    });
}
