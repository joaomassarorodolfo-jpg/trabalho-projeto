// Estado Global da Aplicação
let seguros = [];
let filtroStatusAtual = 'todos';

// Inicialização automatizada
window.onload = function() {
    inicializarDados();
};

function inicializarDados() {
    const dadosLocais = localStorage.getItem('seguros_db');
    if (dadosLocais) {
        seguros = JSON.parse(dadosLocais);
        processarEAtualizarTela();
    } else {
        // Se estiver vazio, tenta buscar um dados.json padrão do servidor/repositório
        fetch('dados.json')
            .then(res => res.json())
            .then(dados => {
                seguros = dados;
                salvarNoLocalStorage();
                processarEAtualizarTela();
            })
            .catch(() => {
                seguros = []; // Começa do zero absoluto se não achar o arquivo
                processarEAtualizarTela();
            });
    }
}

function salvarNoLocalStorage() {
    localStorage.setItem('seguros_db', JSON.stringify(seguros));
}

function processarEAtualizarTela() {
    atualizarDashboard();
    filtrarDados();
}

// Atualização de Métricas Financeiras
function atualizarDashboard() {
    let aprovado = 0, pendente = 0, naoPago = 0;

    seguros.forEach(item => {
        const valor = parseFloat(item.valor) || 0;
        if (item.status === 'aprovado') aprovado += valor;
        if (item.status === 'pendente') pendente += valor;
        if (item.status === 'nao_pago') naoPago += valor;
    });

    document.getElementById('total-aprovado').innerText = `R$ ${aprovado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('total-pendente').innerText = `R$ ${pendente.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    document.getElementById('total-nao-pago').innerText = `R$ ${naoPago.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

// Filtros Inteligentes Combinados (Busca de texto + Botão de Status)
function filtrarDados() {
    const termoBusca = document.getElementById('busca-cliente').value.toLowerCase();
    
    const dadosFiltrados = seguros.filter(item => {
        const matchesStatus = (filtroStatusAtual === 'todos' || item.status === filtroStatusAtual);
        const matchesTexto = item.cliente.toLowerCase().includes(termoBusca) || item.seguro.toLowerCase().includes(termoBusca);
        return matchesStatus && matchesTexto;
    });

    renderizarTabela(dadosFiltrados);
}

function mudarFiltroStatus(status) {
    filtroStatusAtual = status;
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('ativo'));
    
    // Define qual botão ganha a classe visual ativa
    if(status === 'todos') document.getElementById('filtro-todos').classList.add('ativo');
    else event.target.classList.add('ativo');

    filtrarDados();
}

// Renderizador da Tabela Dinâmica com Injeção Segura de Conteúdo
function renderizarTabela(dados) {
    const corpo = document.getElementById('tabela-corpo');
    corpo.innerHTML = '';

    if (dados.length === 0) {
        corpo.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nenhum registro encontrado.</td></tr>`;
        return;
    }

    dados.forEach(item => {
        const tr = document.createElement('tr');
        const statusTexto = item.status === 'nao_pago' ? 'Não Pago' : item.status;
        const valorFormatado = parseFloat(item.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2});

        tr.innerHTML = `
            <td style="font-weight: 600;">${escaparHTML(item.cliente)}</td>
            <td style="color: var(--text-muted);">${escaparHTML(item.seguro)}</td>
            <td>R$ ${valorFormatado}</td>
            <td><span class="status-tag ${item.status}">${statusTexto}</span></td>
            <td style="text-align: right;">
                <button onclick="editarSeguro(${item.id})" class="btn-acao">Editar</button>
                <button onclick="deletarSeguro(${item.id})" class="btn-acao btn-deletar">Excluir</button>
            </td>
        `;
        corpo.appendChild(tr);
    });
}

// Operações de CRUD (Create, Read, Update, Delete)
function abrirModal(id = null) {
    const modal = document.getElementById('modal-seguro');
    const form = document.getElementById('form-seguro');
    form.reset();
    document.getElementById('seguro-id').value = '';

    if (id) {
        document.getElementById('modal-titulo').innerText = 'Editar Registro';
        const item = seguros.find(s => s.id === id);
        if (item) {
            document.getElementById('seguro-id').value = item.id;
            document.getElementById('form-cliente').value = item.cliente;
            document.getElementById('form-seguro-nome').value = item.seguro;
            document.getElementById('form-valor').value = item.valor;
            document.getElementById('form-status').value = item.status;
        }
    } else {
        document.getElementById('modal-titulo').innerText = 'Novo Seguro';
    }
    modal.style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-seguro').style.display = 'none';
}

function salvarSeguro(e) {
    e.preventDefault();
    const id = document.getElementById('seguro-id').value;
    const cliente = document.getElementById('form-cliente').value;
    const seguroNome = document.getElementById('form-seguro-nome').value;
    const valor = parseFloat(document.getElementById('form-valor').value);
    const status = document.getElementById('form-status').value;

    if (id) {
        // Atualização de registro existente
        const index = seguros.findIndex(s => s.id == id);
        if (index !== -1) {
            seguros[index] = { id: parseInt(id), cliente, seguro: seguroNome, valor, status };
        }
    } else {
        // Criação de novo registro com ID incremental único
        const novoId = seguros.length > 0 ? Math.max(...seguros.map(s => s.id)) + 1 : 1;
        seguros.push({ id: novoId, cliente, seguro: seguroNome, valor, status });
    }

    salvarNoLocalStorage();
    processarEAtualizarTela();
    fecharModal();
}

function editarSeguro(id) {
    abrirModal(id);
}

function deletarSeguro(id) {
    if (confirm('Tem certeza de que deseja excluir este registro permanente do navegador?')) {
        seguros = seguros.filter(s => s.id !== id);
        salvarNoLocalStorage();
        processarEAtualizarTela();
    }
}

// Mecanismo de Sincronização Externa (Sem servidor)
function exportarDados() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(seguros, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "dados_seguros_exportados.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importarDados(event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = function(e) {
        try {
            const novosDados = JSON.parse(e.target.result);
            if (Array.isArray(novosDados)) {
                seguros = novosDados;
                salvarNoLocalStorage();
                processarEAtualizarTela();
                alert('Dados importados e sincronizados com sucesso!');
            } else {
                alert('Erro: Formato JSON inválido. Deve ser uma lista de seguros.');
            }
        } catch (erro) {
            alert('Erro ao processar o arquivo JSON.');
        }
    };
    leitor.readAsText(arquivo);
}

// Proteção Elementar contra Ataques XSS
function escaparHTML(string) {
    return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
