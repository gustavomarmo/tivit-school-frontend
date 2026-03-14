import api from './axiosInstance';

/**
 * @param {number} ms
 */
const simulateNetworkDelay = (ms = 300) => new Promise(res => setTimeout(res, ms));

let _mockStudentData = [
    { matricula: "2025001", nome: "Ana Silva", turma: "9º Ano A", status: "Ativo" },
    { matricula: "2025002", nome: "Carlos Santos", turma: "9º Ano A", status: "Ativo" },
    { matricula: "2025003", nome: "Beatriz Lima", turma: "8º Ano B", status: "Ativo" },
    { matricula: "2025004", nome: "Daniel Costa", turma: "9º Ano A", status: "Inativo" },
    { matricula: "2025005", nome: "Elena Rodrigues", turma: "8º Ano B", status: "Ativo" },
    { matricula: "2025006", nome: "Fernando Alves", turma: "7º Ano C", status: "Ativo" },
    { matricula: "2025007", nome: "Gabriela Dias", turma: "7º Ano C", status: "Ativo" },
];

const _mockAbsenceData = [
    { materia: 'Matemática', frequencia: "95%", faltas: 6 },
    { materia: 'Português', frequencia: "98%", faltas: 3 },
    { materia: 'História', frequencia: "95%", faltas: 6 },
    { materia: 'Geografia', frequencia: "100%", faltas: 0 },
    { materia: 'Ciências', frequencia: "98%", faltas: 3 },
    { materia: 'Inglês', frequencia: "100%", faltas: 0 },
];

let _mockNotifications = [
    { id: 1, type: 'success', title: 'Nota Lançada', message: 'Nova nota de Matemática (N2) disponível: 8.5', time: '5 min atrás', read: false, timestamp: Date.now() - 5 * 60 * 1000 },
    { id: 2, type: 'warning', title: 'Prazo de Entrega', message: 'Trabalho de História vence em 2 dias', time: '1 hora atrás', read: false, timestamp: Date.now() - 60 * 60 * 1000 },
    { id: 3, type: 'info', title: 'Evento Escolar', message: 'Feira de Ciências confirmada para 15/12', time: '3 horas atrás', read: false, timestamp: Date.now() - 3 * 60 * 60 * 1000 },
    { id: 4, type: 'success', title: 'Material Disponível', message: 'Novo PDF adicionado em Álgebra Linear', time: 'Ontem', read: true, timestamp: Date.now() - 24 * 60 * 60 * 1000 },
];

// ============================
// LOGIN USUÁRIO
// ============================
export async function loginUser(email, senha) {
    const response = await api.post('/auth/login', { email, senha }, {
        baseURL: 'http://localhost:5051'
    });
    return response.data;
}

// ============================
// CRUD ALUNOS
// ============================
export async function getStudents() {
    const response = await api.get('/alunos');
    return response.data.map(a => ({
        id: a.id,
        matricula: a.matricula,
        nome: a.nome,
        turma: a.turma,
        turmaId: a.turmaId,
        email: a.email,
        status: a.ativo ? 'Ativo' : 'Inativo',
    }));
}

export async function addStudent(studentData) {
    const payload = {
        nome: studentData.nome,
        matricula: studentData.matricula,
        email: studentData.email || `${studentData.matricula}@escola.com`,
        turmaId: studentData.turmaId,
        ativo: studentData.status !== 'Inativo',
    };
    const response = await api.post('/alunos', payload);
    return response.data;
}

export async function editStudent(id, newData) {
    const payload = {
        matricula: newData.matricula,
        nome: newData.nome,
        email: newData.email,
        turmaId: newData.turmaId,
        ativo: newData.status !== 'Inativo',
    };
    const response = await api.put(`/alunos/${id}`, payload);
    return response.data;
}

export async function deleteStudent(id) {
    await api.delete(`/alunos/${id}`);
    return true;
}

// ============================
// CRUD TURMAS
// ============================
export async function getClasses() {
    const response = await api.get('/turmas');
    return response.data;
}

// ============================
// CRUD PROFESSORES
// ============================
export async function getTeachers() {
    const response = await api.get('/professores');
    return response.data.map(p => ({
        id: p.id,
        matricula: p.matricula,
        nome: p.nome,
        email: p.email,
        disciplina: p.especialidade,
        status: p.ativo ? 'Ativo' : 'Inativo',
    }));
}

export async function addTeacher(teacherData) {
    const payload = {
        nome: teacherData.nome,
        matricula: teacherData.matricula,
        email: teacherData.email || `${teacherData.matricula}@escola.com`,
        especialidade: teacherData.disciplina,
        ativo: teacherData.status !== 'Inativo',
    };
    const response = await api.post('/professores', payload);
    return response.data;
}

export async function editTeacher(id, newData) {
    const payload = {
        matricula: newData.matricula,
        nome: newData.nome,
        email: newData.email,
        especialidade: newData.disciplina,
        ativo: newData.status !== 'Inativo',
    };
    const response = await api.put(`/professores/${id}`, payload);
    return response.data;
}

export async function deleteTeacher(id) {
    await api.delete(`/professores/${id}`);
    return true;
}

// ============================
// CRUD DISCIPLINAS
// ============================
export async function getSubjectsList() {
    const response = await api.get('/disciplinas/listar');
    return response.data;
}

export async function getSubjectContent(subject, role) {
    const response = await api.get(`/disciplinas/${subject.id}/conteudo`);
    const data = response.data;

    return data.topicos.map(t => ({
        id: t.id,
        titulo: t.titulo,
        itens: t.materiais.map(m => ({
            id: m.id,
            type: m.tipo,
            nome: m.titulo,
            desc: m.dataEntrega
                ? `Entrega: ${new Date(m.dataEntrega).toLocaleDateString('pt-BR')}`
                : '',
            url: m.url,
            status: (m.tipo === 'assignment' && role === 'aluno')
                ? (m.entregue ? 'Entregue' : 'Pendente')
                : null,
        }))
    }));
}

// ============================
// CRUD TÓPICOS
// ============================
export async function addTopicToSubject(subject, topicTitle) {
    const response = await api.post('/topicos', {
        titulo: topicTitle,
        turmaDisciplinaId: subject.id,
    });
    return response.data;
}

export async function editTopicFromSubject(topicId, newTitle) {
    await api.put(`/topicos/${topicId}`, {
        titulo: newTitle,
        turmaDisciplinaId: 0,
    });
    return true;
}

export async function deleteTopicFromSubject(topicId) {
    await api.delete(`/topicos/${topicId}`);
    return true;
}

// ============================
// CRUD MATERIAIS
// ============================
export async function addSubjectResource(moduleId, recurso) {
    await api.post('/materiais', {
        titulo: recurso.title,
        tipo: recurso.type,
        url: recurso.url || '',
        topicoId: Number(moduleId),
    });
    return { success: true };
}

export async function editMaterialFromSubject(itemId, newData) {
    await api.put(`/materiais/${itemId}`, {
        titulo: newData.nome,
        tipo: newData.type,
        url: newData.url || '',
        topicoId: 0,
    });
    return true;
}

export async function deleteMaterialFromSubject(itemId) {
    await api.delete(`/materiais/${itemId}`);
    return true;
}

// ============================
// NOTAS E BOLETIM
// ============================
export async function getBoletim() {
    const response = await api.get('/notas/boletim');
    return response.data;
}

export async function downloadBoletimPdf() {
    const response = await api.get('/notas/boletim/download', {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'meu_boletim.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export async function getNotasParaLancamento(turmaId, disciplinaId) {
    const response = await api.get('/notas/lancamento', {
        params: { turmaId, disciplinaId }
    });
    return response.data;
}

export async function salvarNotasLote(notas) {
    const response = await api.post('/notas/lote', notas);
    return response.data;
}

// ============================
// FREQUÊNCIA
// ============================
export async function getFrequenciaResumo() {
    const response = await api.get('/frequencias/resumo');
    return response.data;
}

export async function realizarChamada(disciplinaId, data, registros) {
    const response = await api.post('/frequencias/chamada', {
        disciplinaId,
        data,
        registros,
    });
    return response.data;
}

// ============================
// CALENDÁRIO / EVENTOS
// ============================
export async function getCalendarEvents(mes, ano) {
    const response = await api.get('/eventos', { params: { mes, ano } });
    const dict = {};
    for (const evt of response.data) {
        const dateKey = evt.start.substring(0, 10);
        if (!dict[dateKey]) dict[dateKey] = [];
        dict[dateKey].push({ id: evt.id, title: evt.title, type: evt.type });
    }
    return dict;
}

export async function saveCalendarEvent(date, title) {
    const response = await api.post('/eventos', {
        titulo: title,
        descricao: '',
        dataInicio: `${date}T00:00:00`,
        dataFim: null,
        tipo: 'evento',
        turmaId: null
    });
    return response.data;
}

export async function updateCalendarEvent(date, eventId, newTitle) {
    await api.put(`/eventos/${eventId}`, {
        titulo: newTitle,
        descricao: '',
        dataInicio: `${date}T00:00:00`,
        dataFim: null,
        tipo: 'evento',
        turmaId: null
    });
    return true;
}

export async function deleteCalendarEvent(eventId) {
    await api.delete(`/eventos/${eventId}`);
    return true;
}

// ============================
// NOTIFICAÇÕES
// ============================
export async function getNotifications() {
    const response = await api.get('/notificacoes');
    return response.data;
}

export async function markNotificationAsRead(notificationId) {
    await api.put(`/notificacoes/${notificationId}/ler`);
    return true;
}

export async function markAllNotificationsAsRead() {
    await api.put('/notificacoes/ler-todas');
    return true;
}

export async function getUnreadCount() {
    const response = await api.get('/notificacoes/nao-lidas/contagem');
    return response.data;
}

// ============================
// DASHBOARD
// ============================
export async function getProfessorData() {
    const response = await api.get('/dashboards/professor');
    const d = response.data;
    return {
        resumo: {
            totalTurmas: d.kpis?.mediaTurmas ?? 0,
            totalAlunos: d.kpis?.alunosEmRec ?? 0,
            mediaGeral: d.kpis?.mediaTurmas ?? 0,
        },
        proximasAulas: [],
        alunosAtencao: (d.alunosAtencao ?? []).map(a => ({
            id: a.id,
            nome: a.nome,
            turma: a.turma,
            motivo: `Média: ${a.media?.toFixed(1) ?? '-'}`,
            risco: (a.media ?? 10) < 5 ? 'alto' : 'medio',
        })),
    };
}

export async function getCoordinatorData() {
    const response = await api.get('/dashboards/coordenador');
    const d = response.data;
    return {
        resumo: {
            totalAlunos: d.kpis?.totalAlunos ?? 0,
            totalProfessores: d.kpis?.totalProfessores ?? 0,
            turmasAtivas: 0,
        },
        desempenhoPorMateria: {
            labels: (d.graficoDesempenho ?? []).map(g => g.label),
            medias: (d.graficoDesempenho ?? []).map(g => g.value),
        },
        statusAlunos: {
            labels: (d.graficoStatus ?? []).map(g => g.label),
            quantidades: (d.graficoStatus ?? []).map(g => g.value),
        },
    };
}

// ============================
// MATRÍCULA — INTEGRAÇÃO REAL
// ============================
export async function iniciarMatricula(dadosIniciais) {
    const response = await api.post('/matriculas/iniciar', {
        NomeCompleto: dadosIniciais.nome,
        Cpf: dadosIniciais.cpf,
        Email: dadosIniciais.email,
        Telefone: dadosIniciais.telefone,
        DataNascimento: dadosIniciais.dataNascimento || new Date().toISOString(),
    }, { baseURL: 'http://localhost:5051/api' });

    return {
        success: true,
        idSolicitacao: response.data.idSolicitacao,
        reenvio: response.data.reenvio,
    };
}

export async function validarOtpMatricula(email, otpInserido) {
    const response = await api.post('/matriculas/validar-otp', {
        Email: email,
        Codigo: otpInserido,
    }, { baseURL: 'http://localhost:5051/api' });

    const d = response.data;

    const statusToStep = {
        'AguardandoDados': 2,
        'AguardandoAnaliseDocs': 4.5,
        'AguardandoPagamento': 5,
        'Finalizado': 6,
        'Rejeitado': 2,
    };

    return {
        idSolicitacao: d.idSolicitacao,
        status: d.status,
        etapaAtual: statusToStep[d.status] ?? 2,
        nome: d.nome,
        email: d.email,
        cpf: d.cpf,
        telefone: d.telefone,
        endereco: d.endereco,
        nomeResponsavel: d.nomeResponsavel,
        contatoResponsavel: d.contatoResponsavel,
        escolaridade: d.escolaridade,
        serie: d.serie,
        turno: d.turno,
        mensalidade: d.mensalidade,
    };
}

export async function salvarDadosComplementares(idSolicitacao, dadosCompl) {
    await api.put('/matriculas/dados-complementares', {
        SolicitacaoId: idSolicitacao,
        EnderecoCompleto: dadosCompl.endereco,
        Rg: dadosCompl.rg || '',
        NomeResponsavel: dadosCompl.nomeResponsavel,
        ContatoResponsavel: dadosCompl.contatoResponsavel,
        EscolaridadeAnterior: dadosCompl.escolaridade || '',
    }, { baseURL: 'http://localhost:5051/api' });
    return true;
}

export async function uploadDocumentoMatricula(idSolicitacao, tipo, arquivo) {
    const formData = new FormData();
    formData.append('solicitacaoId', idSolicitacao);
    formData.append('tipo', tipo);
    formData.append('arquivo', arquivo);

    const response = await api.post('/matriculas/upload', formData, {
        baseURL: 'http://localhost:5051/api',
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

export async function checarVaga(serie, turno) {
    const response = await api.get('/matriculas/vagas-disponiveis', {
        baseURL: 'http://localhost:5051/api',
    });

    const vagas = response.data;

    const normalizar = (str) =>
        (str ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();

    const serieNorm  = normalizar(serie);
    const turnoNorm  = normalizar(turno);

    const vaga = vagas.find(v => {
        const vSerieNorm = normalizar(v.serie);
        const vTurnoNorm = normalizar(v.turno);
        console.log(`[checarVaga] Comparando: serie "${vSerieNorm}" === "${serieNorm}" | turno "${vTurnoNorm}" === "${turnoNorm}"`);
        return vSerieNorm === serieNorm && vTurnoNorm === turnoNorm;
    });

    console.log('[checarVaga] Vaga encontrada:', vaga ?? 'NENHUMA');

    if (!vaga || !vaga.disponivel) {
        return { disponivel: false, vagasRestantes: vaga?.vagasRestantes ?? 0 };
    }

    return { disponivel: true, valor: vaga.valor, vagasRestantes: vaga.vagasRestantes };
}

export async function selecionarVaga(idSolicitacao, serie, turno) {
    const turnoNorm = turno
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
        .replace(/^./, c => c.toUpperCase());

    console.log('[selecionarVaga] Enviando turno normalizado:', turnoNorm, '| serie:', serie);

    const response = await api.put('/matriculas/selecionar-vaga', {
        SolicitacaoId: idSolicitacao,
        Serie: serie,
        Turno: turnoNorm,
    }, { baseURL: 'http://localhost:5051/api' });

    return response.data;
}

export async function aceitarTermosMatricula(idSolicitacao) {
    await api.put('/matriculas/aceitar-termos', {
        SolicitacaoId: idSolicitacao,
        TermosAceitos: true,
    }, { baseURL: 'http://localhost:5051/api' });
    return true;
}

export async function uploadComprovantePix(idSolicitacao, arquivo) {
    const formData = new FormData();
    formData.append('solicitacaoId', idSolicitacao);
    formData.append('arquivo', arquivo);

    const response = await api.post('/matriculas/comprovante-pix', formData, {
        baseURL: 'http://localhost:5051/api',
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

export async function getMatriculasPendentes() {
    const response = await api.get('/matriculas/pendentes');

    return response.data.map(m => ({
        id: m.id,
        nome: m.nome,
        email: m.email,
        cpf: m.cpf,
        telefone: m.telefone,
        nomeResponsavel: m.nomeResponsavel,
        serie: m.serie,
        turno: m.turno,
        mensalidade: m.mensalidade,
        status: mapStatusToFront(m.status),
        documentos: m.documentos ?? [],
    }));
}

export async function avaliarMatriculaCoord(id, aprovado, observacao = '') {
    await api.put(`/matriculas/${id}/avaliar`, {
        Aprovado: aprovado,
        Observacao: observacao,
    });
    return true;
}

function mapStatusToFront(status) {
    const map = {
        'AguardandoAnaliseDocs': 'ANALISE_COORD',
        'AguardandoPagamento': 'AGUARDANDO_PAGAMENTO',
        'Finalizado': 'CONCLUIDO',
        'Rejeitado': 'REJEITADO',
    };
    return map[status] ?? status;
}

// ============================
// RECUPERAÇÃO DE SENHA
// ============================
export async function solicitarRecuperacaoSenha(email) {
    const response = await api.post('/auth/esqueci-senha', { email }, {
        baseURL: 'http://localhost:5051'
    });
    return response.data;
}

export async function validarOtpSenha(email, codigo) {
    const response = await api.post('/auth/validar-otp', { email, codigo }, {
        baseURL: 'http://localhost:5051'
    });
    return response.data;
}

export async function resetarSenha(email, codigo, novaSenha) {
    const response = await api.post('/auth/resetar-senha', { email, codigo, novaSenha }, {
        baseURL: 'http://localhost:5051'
    });
    return response.data;
}

export async function getAbsenceData() {
    await simulateNetworkDelay(300);
    return Promise.resolve(_mockAbsenceData);
}

export async function saveAttendance(payload) {
    return new Promise(resolve => {
        console.log("Frequência enviada:", payload);
        setTimeout(() => resolve({ success: true }), 500);
    });
}

export async function saveGrades(payload) {
    return new Promise(resolve => {
        console.log("Notas salvas:", payload);
        setTimeout(() => resolve({ success: true }), 600);
    });
}