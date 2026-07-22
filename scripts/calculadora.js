// calculadora.js - DB Softwares (Administrativo + Industrial)

// ============================================
// MODAL DE CAPTURA DE LEAD
// ============================================
const LEAD_STORAGE_KEY = 'db_lead_enviado';

function leadJaEnviado() {
    return localStorage.getItem(LEAD_STORAGE_KEY) === '1';
}

function marcarLeadEnviado() {
    localStorage.setItem(LEAD_STORAGE_KEY, '1');
}

function abrirLeadModal(onConfirm) {
    const overlay = document.getElementById('leadModal');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Foco no primeiro campo
    setTimeout(() => {
        const firstInput = overlay.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);

    // Guardar callback para quando o lead for confirmado
    overlay._onConfirm = onConfirm;
}

function fecharLeadModal() {
    const overlay = document.getElementById('leadModal');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    overlay._onConfirm = null;

    // Limpar campos e erro
    document.getElementById('leadForm').reset();
    const errorEl = document.getElementById('leadFormError');
    errorEl.style.display = 'none';
    document.querySelectorAll('.lead-modal__input.is-invalid, .lead-modal__textarea.is-invalid')
        .forEach(el => el.classList.remove('is-invalid'));
}

// Inicializar eventos do modal após DOM carregado
document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('leadModal');
    const closeBtn = document.getElementById('leadModalClose');
    const leadForm = document.getElementById('leadForm');

    // Fechar ao clicar no X
    closeBtn.addEventListener('click', fecharLeadModal);

    // Fechar ao clicar fora do modal
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) fecharLeadModal();
    });

    // Fechar com Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) fecharLeadModal();
    });

    // Submit do formulário de lead
    leadForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nome = document.getElementById('leadNome').value.trim();
        const email = document.getElementById('leadEmail').value.trim();
        const errorEl = document.getElementById('leadFormError');

        // Limpar estado anterior
        document.querySelectorAll('.lead-modal__input.is-invalid')
            .forEach(el => el.classList.remove('is-invalid'));
        errorEl.style.display = 'none';

        // Validar campos obrigatórios
        let temErro = false;
        if (!nome) {
            document.getElementById('leadNome').classList.add('is-invalid');
            temErro = true;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('leadEmail').classList.add('is-invalid');
            temErro = true;
        }
        if (temErro) {
            errorEl.textContent = 'Por favor, preencha Nome e E-mail corretamente.';
            errorEl.style.display = 'block';
            return;
        }

        // Marcar lead como enviado e fechar modal
        marcarLeadEnviado();
        const onConfirm = overlay._onConfirm;
        fecharLeadModal();

        // Executar a ação original (calcular viabilidade)
        if (typeof onConfirm === 'function') onConfirm();
    });
});

// ============================================
// CONFIGURAÇÕES DOS ENDPOINTS
// ============================================
const API_URL_ADMIN = 'https://calculadora-externa.dbsoftwares.cloud/api/calcular';
const API_URL_INDUSTRIAL = 'https://calculadora-externa.dbsoftwares.cloud/api/calcular-industrial';

// ============================================
// ELEMENTOS DO DOM
// ============================================
const formAdmin = document.getElementById('formAdministrativo');
const formIndustrial = document.getElementById('formIndustrial');
const selectTipoProcesso = document.getElementById('tipo_processo');
const resultadoArea = document.getElementById('resultadoArea');
const btnDiagnostico = document.getElementById('btnDiagnostico');
const btnVoltarAdmin = document.getElementById('btnVoltarAdmin');

// ============================================
// LÓGICA DE ALTERNÂNCIA ENTRE FORMULÁRIOS
// ============================================
function toggleFormularios() {
    const tipo = selectTipoProcesso.value;
    if (tipo === 'industria') {
        formAdmin.style.display = 'none';
        formIndustrial.style.display = 'block';
        resultadoArea.style.display = 'none';
    } else {
        formAdmin.style.display = 'block';
        formIndustrial.style.display = 'none';
        resultadoArea.style.display = 'none';
    }
}

selectTipoProcesso.addEventListener('change', toggleFormularios);

if (btnVoltarAdmin) {
    btnVoltarAdmin.addEventListener('click', () => {
        selectTipoProcesso.value = '';
        toggleFormularios();
    });
}

toggleFormularios();

// ============================================
// PRÉ-SELEÇÃO VIA PARÂMETRO DE URL
// ============================================
(function () {
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get('tipo');
    if (tipo === 'industrial') {
        selectTipoProcesso.value = 'industria';
        toggleFormularios();
    } else if (tipo === 'administrativo') {
        selectTipoProcesso.value = 'backoffice';
        toggleFormularios();
    }
})();

// ============================================
// FUNÇÕES GERAIS DE UI
// ============================================
function setLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    if (isLoading) {
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline';
        button.disabled = true;
    } else {
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

function exibirErro(mensagem) {
    alert('❌ ' + mensagem);
}

function limparResultado() {
    resultadoArea.style.display = 'none';
    const resultNumbers = document.getElementById('resultNumbers');
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (resultNumbers) resultNumbers.style.display = 'grid';
    if (scoreDisplay) scoreDisplay.style.display = 'block';
}

// ============================================
// TEMPLATES DE SAÍDA ADMINISTRATIVA
// ============================================
const TEMPLATES_ADMIN = {
    'PRONTO': {
        titulo: 'PRONTO',
        leitura: 'Este processo já está pronto para avançar com automação, pois apresenta boa estabilidade, aceitação de padronização e baixa incidência de exceções.',
        melhorias: 'Com governança adequada e automação orientada por dados, este processo pode evoluir em:\n\n• Execução autônoma e consistente\n• Redução de retrabalho e falhas manuais\n• Mais previsibilidade e controle sobre os resultados',
        nota: '',
        proximo: 'O próximo passo é validar, por meio de um diagnóstico rápido e gratuito, o escopo ideal de automação para o seu negócio.'
    },
    'MATURACAO': {
        titulo: 'MATURAÇÃO',
        leitura: 'Este processo já funciona de forma regular, mas ainda apresenta oportunidades claras de melhoria em consistência e confiabilidade.',
        melhorias: 'Com um diagnóstico estruturado, podemos transformar este cenário em:\n\n• Maior estabilidade operacional\n• Redução da dependência de decisões manuais\n• Escalabilidade com menos esforço operacional',
        nota: '',
        proximo: 'Agende um diagnóstico DB para mapearmos juntos os pontos de melhoria e definirmos um plano prático de evolução.'
    },
    'PREPARACAO': {
        titulo: 'PREPARAÇÃO',
        leitura: 'Este processo ainda não está maduro para automação direta, mas isso é mais comum do que parece. Muitas empresas começam exatamente aqui.',
        melhorias: 'Com nosso apoio, podemos:\n\n• Organizar as regras e fluxos do processo\n• Reduzir variações e exceções que travam o dia a dia\n• Criar as condições ideais para uma automação segura e escalável',
        nota: '',
        proximo: 'O primeiro passo é um diagnóstico DB especializado, sem compromisso, para identificarmos exatamente o que precisa ser ajustado e como podemos ajudar.'
    }
};

const TEMPLATE_SEM_PADRONIZACAO = {
    titulo: 'PREPARAÇÃO',
    leitura: 'Entendemos que a padronização pode parecer um desafio, mas ela é a chave para ganhar escala, previsibilidade e reduzir custos operacionais.',
    melhorias: 'Muitos clientes chegam com essa mesma preocupação. Com um diagnóstico leve e objetivo, mostramos como é possível padronizar sem engessar o negócio.',
    nota: '',
    proximo: 'Que tal reservarmos 30 minutos para um diagnóstico sem compromisso? Podemos apresentar cases reais de empresas que tinham a mesma visão inicial e hoje colhem os benefícios da padronização.'
};

const MAP_CLASSIFICACAO_ADMIN = {
    'VIAVEL': 'PRONTO',
    'ATENCAO': 'MATURACAO',
    'INVIAVEL': 'PREPARACAO'
};

// ============================================
// TEMPLATES DE SAÍDA INDUSTRIAL
// ============================================
const TEMPLATES_INDUSTRIAL = {
    'PRONTO': {
        titulo: 'PRONTO',
        leitura: 'Este processo industrial já está pronto para avançar com automação, pois apresenta comportamento estável, variabilidade controlada e boa previsibilidade operacional.',
        melhorias: 'Com governança operacional baseada em dados e automação orientada por contexto, este processo tende a evoluir em:\n\n• Execução autônoma e consistente\n• Redução de paradas não planejadas\n• Decisões aplicadas no momento certo para preservar a estabilidade',
        nota: '',
        proximo: 'O próximo passo é validar, por meio de um diagnóstico DB Industrial, o escopo ideal de governança e automação para o seu negócio.'
    },
    'MATURACAO': {
        titulo: 'MATURAÇÃO',
        leitura: 'Este processo industrial já opera de forma funcional, mas ainda apresenta oportunidades claras de evolução em estabilidade e previsibilidade.',
        melhorias: 'Com um diagnóstico estruturado, podemos transformar este cenário em:\n\n• Maior estabilidade operacional\n• Antecipação de desvios e redução de perdas\n• Menor dependência de ajustes manuais',
        nota: '',
        proximo: 'Agende um diagnóstico DB Industrial para mapearmos juntos os pontos de melhoria e definirmos um plano prático de evolução.'
    },
    'PREPARACAO': {
        titulo: 'PREPARAÇÃO',
        leitura: 'Este processo industrial ainda não está maduro para automação direta, mas isso é mais comum do que parece. Muitas indústrias começam exatamente aqui.',
        melhorias: 'Com nosso apoio, podemos:\n\n• Organizar e estabilizar os parâmetros operacionais\n• Reduzir variações excessivas que impactam a produção\n• Criar as condições ideais para uma automação segura e escalável',
        nota: '',
        proximo: 'O primeiro passo é um diagnóstico DB Industrial especializado, sem compromisso, para identificarmos exatamente o que precisa ser ajustado e como podemos ajudar.'
    }
};

const MAP_NIVEL_INDUSTRIAL = {
    'BAIXO': 'PRONTO',
    'MEDIO': 'MATURACAO',
    'ALTO': 'PREPARACAO',
    'CRITICO': 'PREPARACAO'
};

// ============================================
// FORMULÁRIO ADMINISTRATIVO
// ============================================
const POTENCIAL_EFICIENCIA = { 'baixo': 0.30, 'medio': 0.50, 'alto': 0.70 };
const TAXA_RETRABALHO = { '0-5': 0.05, '5-15': 0.10, '15+': 0.20 };
const REDUCAO_ERROS = { 0.05: 0.30, 0.10: 0.50, 0.20: 0.70 };
const INVESTIMENTO_DB = { MIN: 1500, MAX: 4000 };
const IAA_TIPO = { 'backoffice': 3, 'financeiro': 2, 'compras': 2, 'fiscal': 1, 'sap_erp': 1, 'outro': 1 };

function calcularICOScore(grauEstrutura, criticidade, taxaRetrabalho) {
    let score = 0;
    if (taxaRetrabalho > 0.10) score += 1;
    if (grauEstrutura === 'baixo') score += 1;
    if (criticidade === 'alta' || criticidade === 'critica') score += 1;
    return score;
}

function classificarICO(score) {
    if (score <= 1) return 'baixo';
    if (score === 2) return 'medio';
    return 'alto';
}

function coletarDadosAdmin() {
    const aceitaPadronizacaoRadio = document.querySelector('input[name="aceita_padronizacao"]:checked');
    return {
        tipo_processo: selectTipoProcesso.value,
        grau_estruturacao: document.getElementById('grau_estruturacao').value,
        criticidade: document.getElementById('criticidade').value,
        dependencia_manual: document.getElementById('dependencia_manual').value,
        aceita_padronizacao: aceitaPadronizacaoRadio ? aceitaPadronizacaoRadio.value === 'true' : null,
        volume_mensal: parseInt(document.getElementById('volume_mensal').value, 10),
        tempo_medio_min: parseFloat(document.getElementById('tempo_medio_min').value),
        custo_hora: parseFloat(document.getElementById('custo_hora').value),
        taxa_retrabalho: document.getElementById('taxa_retrabalho').value
    };
}

function validarDadosAdmin(dados) {
    const erros = [];
    if (!dados.tipo_processo) erros.push('Tipo de processo');
    if (!dados.grau_estruturacao) erros.push('Grau de estruturação');
    if (!dados.criticidade) erros.push('Criticidade');
    if (!dados.dependencia_manual) erros.push('Nível de dependência manual');
    if (dados.aceita_padronizacao === null) erros.push('Aceita padronização');
    if (!dados.volume_mensal || dados.volume_mensal <= 0) erros.push('Volume mensal > 0');
    if (!dados.tempo_medio_min || dados.tempo_medio_min <= 0) erros.push('Tempo médio > 0');
    if (!dados.custo_hora || dados.custo_hora <= 0) erros.push('Custo da hora > 0');
    if (!dados.taxa_retrabalho) erros.push('Taxa de retrabalho');
    return erros;
}

function exibirResultadoAdmin(resultado) {
    const formatMoney = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const isBloqueioPadronizacao = resultado.motivo === 'nao_aceita_padronizacao';

    let template;
    let templateKey;

    if (isBloqueioPadronizacao) {
        template = TEMPLATE_SEM_PADRONIZACAO;
        templateKey = 'PREPARACAO';
    } else {
        templateKey = MAP_CLASSIFICACAO_ADMIN[resultado.classificacao] || 'PREPARACAO';
        template = TEMPLATES_ADMIN[templateKey];
    }

    const iconMap = { 'PRONTO': '✅', 'MATURACAO': '⚖️', 'PREPARACAO': '🔧' };
    const badgeClassMap = { 'PRONTO': 'viável', 'MATURACAO': 'atenção', 'PREPARACAO': 'inviável' };

    document.getElementById('resultIcon').innerHTML = iconMap[templateKey] || '📊';
    document.getElementById('resultTitulo').innerHTML = `Situação: ${template.titulo}`;

    const badge = document.getElementById('resultClassificacaoBadge');
    badge.innerHTML = `${iconMap[templateKey]} ${template.titulo}`;
    badge.className = `result-classificacao ${badgeClassMap[templateKey] || 'inviável'}`;

    let mensagemCompleta = `
🔎 Resultado da Análise

📌 Leitura Operacional Atual

${template.leitura}

✅ O que pode melhorar na operação

${template.melhorias}
    `;

    if (template.nota && template.nota !== '') {
        mensagemCompleta += `\n📌 ${template.nota}\n`;
    }

    mensagemCompleta += `
➡️ Próximo passo recomendado

${template.proximo}
    `;

    document.getElementById('resultMensagem').innerHTML = mensagemCompleta.replace(/\n/g, '<br>');
    document.getElementById('resultEconomiaMensal').innerHTML = formatMoney(resultado.economia_mensal);
    document.getElementById('resultEconomiaAnual').innerHTML = formatMoney(resultado.economia_anual);
    document.getElementById('resultHorasLiberadas').innerHTML = `${resultado.horas_liberadas.toFixed(1)} h`;

    const criticidadeMap = { 'baixa': 'Baixa', 'media': 'Média', 'alta': 'Alta', 'critica': 'Crítica' };
    document.getElementById('resultCriticidade').innerHTML = criticidadeMap[resultado.criticidade] || resultado.criticidade;

    const scoreEl = document.getElementById('resultScore');
    if (scoreEl && resultado.score !== undefined) scoreEl.innerHTML = resultado.score;

    document.getElementById('resultNumbers').style.display = 'grid';
    document.getElementById('scoreDisplay').style.display = 'block';
    resultadoArea.style.display = 'block';
    resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function executarCalculoAdmin() {
    const dados = coletarDadosAdmin();
    limparResultado();
    setLoading(document.getElementById('btnCalcularAdmin'), true);
    try {
        const res = await fetch(API_URL_ADMIN, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro || 'Erro no servidor');
        exibirResultadoAdmin(data);
    } catch (err) {
        exibirErro('Erro ao calcular viabilidade administrativa: ' + err.message);
    } finally {
        setLoading(document.getElementById('btnCalcularAdmin'), false);
    }
}

async function handleSubmitAdmin(event) {
    event.preventDefault();
    const dados = coletarDadosAdmin();
    const erros = validarDadosAdmin(dados);
    if (erros.length) return exibirErro('Campos obrigatórios:\n- ' + erros.join('\n- '));

    if (leadJaEnviado()) {
        executarCalculoAdmin();
    } else {
        abrirLeadModal(executarCalculoAdmin);
    }
}
formAdmin.addEventListener('submit', handleSubmitAdmin);

// ============================================
// FORMULÁRIO INDUSTRIAL
// ============================================
function coletarDadosIndustrial() {
    const impactoForaHorario = document.querySelector('input[name="ind_impacto_fora_horario"]:checked');
    return {
        tipo_processo: document.getElementById('ind_tipo_processo').value,
        paradas_mes: document.getElementById('ind_paradas_mes').value,
        tempo_retomada: document.getElementById('ind_tempo_retomada').value,
        custo_hora_parada: document.getElementById('ind_custo_hora_parada').value,
        regime: document.getElementById('ind_regime').value,
        risco_batelada: document.getElementById('ind_risco_batelada').value,
        valor_batelada: document.getElementById('ind_valor_batelada').value,
        dependencia_tacita: document.getElementById('ind_dependencia_tacita').value,
        momento_deteccao: document.getElementById('ind_momento_deteccao').value,
        tempo_consolidacao: document.getElementById('ind_tempo_consolidacao').value,
        impacto_fora_horario: impactoForaHorario ? impactoForaHorario.value : null
    };
}

function validarDadosIndustrial(dados) {
    const erros = [];
    if (!dados.tipo_processo) erros.push('Tipo de processo industrial');
    if (!dados.paradas_mes) erros.push('Paradas no mês');
    if (!dados.tempo_retomada) erros.push('Tempo de retomada');
    if (!dados.custo_hora_parada) erros.push('Custo da hora parada');
    if (!dados.regime) erros.push('Regime operacional');
    if (!dados.risco_batelada) erros.push('Risco de perda de lote');
    if (!dados.valor_batelada) erros.push('Valor do lote');
    if (!dados.dependencia_tacita) erros.push('Dependência de conhecimento');
    if (!dados.momento_deteccao) erros.push('Momento de detecção');
    if (!dados.tempo_consolidacao) erros.push('Tempo de consolidação');
    if (dados.impacto_fora_horario === null) erros.push('Impacto fora do horário');
    return erros;
}

function exibirResultadoIndustrial(data) {
    const nivelOriginal = data.indice_vulnerabilidade;
    const templateKey = MAP_NIVEL_INDUSTRIAL[nivelOriginal] || 'PREPARACAO';
    const template = TEMPLATES_INDUSTRIAL[templateKey];

    const iconMap = { 'PRONTO': '✅', 'MATURACAO': '⚖️', 'PREPARACAO': '🔧' };
    const badgeClassMap = { 'PRONTO': 'viável', 'MATURACAO': 'atenção', 'PREPARACAO': 'inviável' };

    document.getElementById('resultIcon').innerHTML = iconMap[templateKey] || '⚠️';
    document.getElementById('resultTitulo').innerHTML = `Situação: ${template.titulo}`;

    const badge = document.getElementById('resultClassificacaoBadge');
    badge.innerHTML = `${iconMap[templateKey]} ${template.titulo}`;
    badge.className = `result-classificacao ${badgeClassMap[templateKey] || 'inviável'}`;

    let mensagemCompleta = `
🔎 Resultado da Análise

📌 Leitura Operacional Atual

${template.leitura}

✅ O que pode melhorar na operação

${template.melhorias}
    `;

    if (template.nota && template.nota !== '') {
        mensagemCompleta += `\n📌 ${template.nota}\n`;
    }

    mensagemCompleta += `
➡️ Próximo passo recomendado

${template.proximo}
    `;

    document.getElementById('resultMensagem').innerHTML = mensagemCompleta.replace(/\n/g, '<br>');

    document.getElementById('resultNumbers').style.display = 'none';
    document.getElementById('scoreDisplay').style.display = 'none';
    resultadoArea.style.display = 'block';
    resultadoArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function executarCalculoIndustrial() {
    const dados = coletarDadosIndustrial();
    limparResultado();
    setLoading(document.getElementById('btnCalcularIndustrial'), true);
    try {
        const res = await fetch(API_URL_INDUSTRIAL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.erro || 'Erro no servidor');
        exibirResultadoIndustrial(data);
    } catch (err) {
        exibirErro('Erro ao calcular vulnerabilidade industrial: ' + err.message);
    } finally {
        setLoading(document.getElementById('btnCalcularIndustrial'), false);
    }
}

async function handleSubmitIndustrial(event) {
    event.preventDefault();
    const dados = coletarDadosIndustrial();
    const erros = validarDadosIndustrial(dados);
    if (erros.length) return exibirErro('Campos industriais obrigatórios:\n- ' + erros.join('\n- '));

    if (leadJaEnviado()) {
        executarCalculoIndustrial();
    } else {
        abrirLeadModal(executarCalculoIndustrial);
    }
}
formIndustrial.addEventListener('submit', handleSubmitIndustrial);

// ============================================
// BOTÃO DE DIAGNÓSTICO (comum)
// ============================================
btnDiagnostico.addEventListener('click', () => {
    let tipo = '';
    if (formIndustrial.style.display === 'block') {
        tipo = document.getElementById('ind_tipo_processo').value || 'industrial';
    } else {
        tipo = document.getElementById('tipo_processo').value || 'administrativo';
    }
    const msg = `Olá! Gostaria de um diagnóstico aprofundado. Processo: ${tipo}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
});
