
let dadosSeguros = [];

// Função para buscar os dados do arquivo JSON simulando o Banco de Dados
async function carregarDados() {
    try {
        // Busca o arquivo dados.json no seu repositório
        const resposta = await fetch('dados.json');
        dadosSeguros = await respuesta.json();
        
        atualizarDashboard(dadosSeguros);
        renderizarTabela(dadosSeguros);
    } catch (erro) {
        console.error("Erro ao carregar os dados:", erro);
    }
}

// Calcula os totais dos cards
function atualizarDashboard(dados) {
    let aprovado = 0;
    let pendente = 0;
    let naoPago = 0;

    dados.forEach(item => {
        if (item.status === 'aprovado') aprovado += item.valor;
        if (item.status === 'pendente') pendente += item.valor;
        if (item.status === 'nao_pago') naoPago += item.valor;
    });

    document.getElementById('total-aprovado').innerText = `R$ ${aprovado.toFixed(2)}`;
    document.getElementById('total-pendente').innerText = `R$ ${pendente.toFixed(2)}`;
    document.getElementById('total-nao-pago').innerText = `R$ ${naoPago.toFixed(2)}`;
}

// Desenha a tabela na tela
function renderizarTabela(dados) {
    const corpoTabela = document.getElementById('tabela-corpo');
    corpoTabela.innerHTML = '';

    dados.forEach(item => {
        const linha = document.createElement('tr');
        
        let statusTexto = item.status.replace('_', ' ');
        
        linha.innerHTML = `
            <td>${item.id}</td>
            <td>${item.cliente}</td>
            <td>${item.seguro}</td>
            <td>R$ ${item.valor.toFixed(2)}</td>
            <td><span class="status-tag ${item.status}">${statusTexto}</span></td>
        `;
        corpoTabela.appendChild(linha);
    });
}

// Filtra os dados ao clicar nos botões
function filtrarTabela(status) {
    if (status === 'todos') {
        renderizarTabela(dadosSeguros);
    } else {
        const filtrados = dadosSeguros.filter(item => item.status === status);
        renderizarTabela(filtrados);
    }
}

// Inicializa o sistema ao abrir a página
window.onload = carregarDados;
