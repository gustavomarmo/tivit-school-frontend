import api from './axiosInstance';

/**
 * @param {number} ms
 */
const simulateNetworkDelay = (ms = 300) => new Promise(res => setTimeout(res, ms));

const getMatriculasDB = () => JSON.parse(localStorage.getItem('matriculas_db') || '[]');
const saveMatriculasDB = (data) => localStorage.setItem('matriculas_db', JSON.stringify(data));

let _calendarEvents = JSON.parse(localStorage.getItem('calendarEvents')) || {};

let _mockStudentData = [
    { matricula: "2025001", nome: "Ana Silva", turma: "9º Ano A", status: "Ativo" },
    { matricula: "2025002", nome: "Carlos Santos", turma: "9º Ano A", status: "Ativo" },
    { matricula: "2025003", nome: "Beatriz Lima", turma: "8º Ano B", status: "Ativo" },
    { matricula: "2025004", nome: "Daniel Costa", turma: "9º Ano A", status: "Inativo" },
    { matricula: "2025005", nome: "Elena Rodrigues", turma: "8º Ano B", status: "Ativo" },
    { matricula: "2025006", nome: "Fernando Alves", turma: "7º Ano C", status: "Ativo" },
    { matricula: "2025007", nome: "Gabriela Dias", turma: "7º Ano C", status: "Ativo" },
];

let professoresMock = [
    { matricula: 'P001', nome: 'Roberto Carlos', disciplina: 'Matemática', status: 'Ativo' },
    { matricula: 'P002', nome: 'Ana Maria', disciplina: 'Português', status: 'Ativo' },
    { matricula: 'P003', nome: 'Cláudio Santos', disciplina: 'História', status: 'Inativo' },
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
    {
        id: 1,
        type: 'success',
        title: 'Nota Lançada',
        message: 'Nova nota de Matemática (N2) disponível: 8.5',
        time: '5 min atrás',
        read: false,
        timestamp: Date.now() - 5 * 60 * 1000
    },
    {
        id: 2,
        type: 'warning',
        title: 'Prazo de Entrega',
        message: 'Trabalho de História vence em 2 dias',
        time: '1 hora atrás',
        read: false,
        timestamp: Date.now() - 60 * 60 * 1000
    },
    {
        id: 3,
        type: 'info',
        title: 'Evento Escolar',
        message: 'Feira de Ciências confirmada para 15/12',
        time: '3 horas atrás',
        read: false,
        timestamp: Date.now() - 3 * 60 * 60 * 1000
    },
    {
        id: 4,
        type: 'success',
        title: 'Material Disponível',
        message: 'Novo PDF adicionado em Álgebra Linear',
        time: 'Ontem',
        read: true,
        timestamp: Date.now() - 24 * 60 * 60 * 1000
    }
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

    console.log(response.data[0])

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
        nome: newData.nome,
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
    console.log('Turmas retornadas:', response.data);
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
        nome: newData.nome,
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

export async function getNotasParaLancamento(turmaId, disciplinaId, bimestre) {
    const response = await api.get('/notas/lancamento', {
        params: { turmaId, disciplinaId, bimestre }
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

export async function getCalendarEvents() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            
            resolve({
                [`${year}-${month}-05`]: ['Entrega de Trabalho'],
                [`${year}-${month}-12`]: ['Prova de Matemática'],
                [`${year}-${month}-15`]: ['Feriado Escolar'],
                [`${year}-${month}-20`]: ['Reunião de Pais', 'Conselho de Classe'],
                [`${year}-${month}-25`]: ['Feira de Ciências']
            });
        }, 300);
    });
}

/**
 * @param {string} date
 * @param {string} title
 * @returns {Promise<boolean>}
 */
export async function saveCalendarEvent(date, title) {
    await simulateNetworkDelay(300);
    
    if (!_calendarEvents[date]) {
        _calendarEvents[date] = [];
    }
    _calendarEvents[date].push(title);
    
    localStorage.setItem('calendarEvents', JSON.stringify(_calendarEvents));
    
    return Promise.resolve(true);
}

export async function deleteCalendarEvent(date, title) {
    await simulateNetworkDelay(300);

    if (_calendarEvents[date]) {
        _calendarEvents[date] = _calendarEvents[date].filter(t => t !== title);
        if (_calendarEvents[date].length === 0) {
            delete _calendarEvents[date];
        }
        localStorage.setItem('calendarEvents', JSON.stringify(_calendarEvents));
    }

    return Promise.resolve(true);
}

export async function updateCalendarEvent(date, oldTitle, newTitle) {
    await simulateNetworkDelay(300);

    if (_calendarEvents[date]) {
        const index = _calendarEvents[date].indexOf(oldTitle);
        if (index > -1) {
            _calendarEvents[date][index] = newTitle;
            localStorage.setItem('calendarEvents', JSON.stringify(_calendarEvents));
        }
    }

    return Promise.resolve(true);
}

/**
 * @returns {Promise<Array>}
 */
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

/**
 * @param {string} selectedSubject
 * @returns {Promise<object>}
 */
export async function getSubjectEvolutionData(selectedSubject) {
    await simulateNetworkDelay(150);
    
    const subjectData = _mockBoletimData.find(row => row.materia === selectedSubject);
    
    if (!subjectData) {
        return Promise.reject(new Error('Matéria não encontrada'));
    }

    const chartLabels = ['1ºBim (N1)', '1ºBim (N2)', '2ºBim (N1)', '2ºBim (N2)'];
    const chartData = [ 
        subjectData.n1_n1, 
        subjectData.n1_n2, 
        subjectData.n2_n1, 
        subjectData.n2_n2 
    ];
    
    return Promise.resolve({ labels: chartLabels, data: chartData });
}

/**
 * @returns {Promise<Array>}
 */
export async function getAvailableSubjects() {
    await simulateNetworkDelay(100);
    const materias = _mockBoletimData.map(row => row.materia);
    const materiasUnicas = [...new Set(materias)]; 
    return Promise.resolve(materiasUnicas);
}


export async function getProfessorData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                resumo: {
                    totalTurmas: 5,
                    totalAlunos: 150,
                    mediaGeral: 7.2
                },
                proximasAulas: [
                    { id: 1, turma: '3º Ano A', disciplina: 'Matemática', horario: '08:00' },
                    { id: 2, turma: '2º Ano B', disciplina: 'Física', horario: '10:00' },
                ],
                alunosAtencao: [
                    { id: 1, nome: 'Lucas Mendes', turma: '3º A', motivo: 'Nota baixa em 2 provas', risco: 'alto' },
                    { id: 2, nome: 'Fernanda Souza', turma: '2º B', motivo: '3 faltas seguidas', risco: 'medio' }
                ]
            });
        }, 500);
    });
}

export async function getCoordinatorData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                resumo: {
                    totalAlunos: 1250,
                    totalProfessores: 45,
                    turmasAtivas: 32
                },
                desempenhoPorMateria: {
                    labels: ['Matemática', 'Português', 'História', 'Geografia', 'Ciências', 'Inglês'],
                    medias: [6.5, 7.8, 8.2, 7.5, 7.0, 8.5]
                },
                statusAlunos: {
                    labels: ['Aprovados', 'Em Recuperação', 'Reprovados'],
                    quantidades: [850, 120, 30]
                }
            });
        }, 800);
    });
}

const _mockMateriasContent = {
    "Matemática": [
        {
            id: 1,
            titulo: "Álgebra Linear",
            itens: [
                { 
                    type: "file", 
                    id: 101, 
                    nome: "Lista de Exercícios 01.pdf", 
                    desc: "Exercícios de revisão", 
                    data: "20/10",
                    url: "https://exemplo.com/arquivos/lista-exercicios-01.pdf"
                },
                { 
                    type: "link", 
                    id: 102, 
                    nome: "Vídeo Aula: Matrizes", 
                    desc: "YouTube", 
                    data: "21/10",
                    url: "https://www.youtube.com/watch?v=exemplo123"
                }
            ]
        },
        {
            id: 2,
            titulo: "Geometria Analítica",
            itens: [
                { 
                    type: "assignment", 
                    id: 201, 
                    nome: "Trabalho em Grupo", 
                    desc: "Entrega até 30/10", 
                    status: "Pendente",
                    url: "https://exemplo.com/trabalhos/trabalho-grupo.pdf"
                }
            ]
        }
    ],
    "História": [
        {
            id: 3,
            titulo: "Segunda Guerra Mundial",
            itens: [
                { 
                    type: "file", 
                    id: 301, 
                    nome: "Resumo do Capítulo 4.pdf", 
                    desc: "Leitura obrigatória", 
                    data: "15/10",
                    url: "https://exemplo.com/resumos/capitulo-4.pdf"
                },
                { 
                    type: "assignment", 
                    id: 302, 
                    nome: "Redação sobre o Dia D", 
                    desc: "Mínimo 30 linhas", 
                    status: "Entregue",
                    url: "https://exemplo.com/redacoes/dia-d.pdf"
                }
            ]
        }
    ]
};

const _defaultSubjects = ["Matemática", "Português", "História", "Geografia", "Ciências", "Inglês"];
_defaultSubjects.forEach(s => {
    if (!_mockMateriasContent[s]) _mockMateriasContent[s] = [];
});

const _mockExtraContent = {
    "Robótica": [
        {
            id: 1,
            titulo: "Introdução ao Arduino",
            itens: [
                { 
                    type: "link", 
                    id: 501, 
                    nome: "O que é Arduino?", 
                    desc: "Vídeo introdutório", 
                    url: "https://www.youtube.com/watch?v=exemploRobo"
                },
                { 
                    type: "file", 
                    id: 502, 
                    nome: "Esquema Elétrico Básico.pdf", 
                    desc: "PDF para montagem", 
                    url: "#"
                }
            ]
        }
    ],
    "Xadrez": [
        {
            id: 1,
            titulo: "Aberturas",
            itens: [
                { 
                    type: "file", 
                    id: 601, 
                    nome: "Guia de Aberturas.pdf", 
                    desc: "Material de estudo", 
                    url: "#"
                }
            ]
        },
        {
            id: 2,
            titulo: "Torneio Interno",
            itens: [
                { 
                    type: "assignment", 
                    id: 602, 
                    nome: "Inscrição no Torneio", 
                    desc: "Envie o formulário preenchido", 
                    status: "Pendente",
                    url: "#"
                }
            ]
        }
    ],
    "Futsal": [
        {
            id: 1,
            titulo: "Táticas",
            itens: [
                { 
                    type: "link", 
                    id: 701, 
                    nome: "Jogadas Ensaiadas", 
                    desc: "Vídeo tático", 
                    url: "#"
                }
            ]
        }
    ]
};

export async function uploadStudentAssignment(assignmentId, file) {
    await simulateNetworkDelay(1000);
    console.log(`Arquivo ${file.name} enviado para a atividade ${assignmentId}`);
    return Promise.resolve(true);
}

export async function getExtraList() {
    await simulateNetworkDelay(200);
    return Promise.resolve(Object.keys(_mockExtraContent));
}

export async function getExtraContent(activityName) {
    await simulateNetworkDelay(300);
    return Promise.resolve(_mockExtraContent[activityName] || []);
}

/**
 * @returns {Promise<Array>}
 */
export async function getNotifications() {
    await simulateNetworkDelay(200);
    return Promise.resolve([..._mockNotifications].sort((a, b) => b.timestamp - a.timestamp));
}

/**
 * @param {number} notificationId
 * @returns {Promise<boolean>}
 */
export async function markNotificationAsRead(notificationId) {
    await simulateNetworkDelay(150);
    
    const notification = _mockNotifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        return Promise.resolve(true);
    }
    
    return Promise.reject("Notificação não encontrada");
}

/**
 * @returns {Promise<boolean>}
 */
export async function markAllNotificationsAsRead() {
    await simulateNetworkDelay(200);
    
    _mockNotifications.forEach(notification => {
        notification.read = true;
    });
    
    return Promise.resolve(true);
}

/**
 * @returns {Promise<number>}
 */
export async function getUnreadCount() {
    await simulateNetworkDelay(100);
    const count = _mockNotifications.filter(n => !n.read).length;
    return Promise.resolve(count);
}

/**
 * @returns {Promise<Array>}
 */
export async function getTurmasList() {
    await simulateNetworkDelay(200);
    const turmas = [...new Set(_mockStudentData.map(s => s.turma))].sort();
    return Promise.resolve(turmas);
}

export async function saveGrades(payload) {
    return new Promise(resolve => {
        console.log("Notas salvas:", payload);
        setTimeout(() => resolve({ success: true }), 600);
    });
}

export async function iniciarMatricula(dadosIniciais) {
    return new Promise(resolve => {
        setTimeout(() => {
            const db = getMatriculasDB();
            let matricula = db.find(m => m.email === dadosIniciais.email);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            if (!matricula) {
                matricula = {
                    ...dadosIniciais,
                    id: Date.now().toString(),
                    otp: otp,
                    status: 'AGUARDANDO_OTP',
                    etapaAtual: 2
                };
                db.push(matricula);
            } else {
                matricula.otp = otp;
            }

            saveMatriculasDB(db);
            console.log(`[E-mail Enviado] Seu código OTP é: ${otp}`);
            resolve({ success: true, otp: otp });
        }, 500);
    });
}

export async function validarOtpMatricula(email, otpInserido) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getMatriculasDB();
            const matricula = db.find(m => m.email === email && m.otp === otpInserido);
            
            if (matricula) {
                if(matricula.status === 'AGUARDANDO_OTP') matricula.status = 'PREENCHENDO';
                saveMatriculasDB(db);
                resolve(matricula);
            } else {
                reject("E-mail ou Código OTP inválidos.");
            }
        }, 500);
    });
}

export async function checarVaga(serie, turno) {
    return new Promise(resolve => {
        setTimeout(() => {
            if (serie === '1º Ano EM' && turno === 'Noite') {
                resolve({ disponivel: false });
            } else {
                const valor = turno === 'Manhã' ? 1500 : turno === 'Tarde' ? 1300 : 1100;
                resolve({ disponivel: true, valor: valor });
            }
        }, 400);
    });
}

export async function salvarEtapaMatricula(email, dadosNovos, novoStatus) {
    return new Promise(resolve => {
        setTimeout(() => {
            const db = getMatriculasDB();
            const index = db.findIndex(m => m.email === email);
            if (index !== -1) {
                db[index] = { ...db[index], ...dadosNovos, status: novoStatus };
                saveMatriculasDB(db);
                resolve(db[index]);
            }
        }, 500);
    });
}

export async function getMatriculasPendentes() {
    return new Promise(resolve => {
        setTimeout(() => {
            const db = getMatriculasDB();
            resolve(db.filter(m => m.status !== 'AGUARDANDO_OTP' && m.status !== 'PREENCHENDO'));
        }, 400);
    });
}

export async function avaliarMatriculaCoord(email, novoStatus) {
    return new Promise(resolve => {
        setTimeout(() => {
            const db = getMatriculasDB();
            const index = db.findIndex(m => m.email === email);
            if (index !== -1) {
                db[index].status = novoStatus;
                saveMatriculasDB(db);
                resolve({ success: true });
            }
        }, 500);
    });
}