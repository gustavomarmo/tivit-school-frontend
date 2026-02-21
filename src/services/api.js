
/**
 * @param {number} ms
 */
const simulateNetworkDelay = (ms = 300) => new Promise(res => setTimeout(res, ms));


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


/**
 * @param {string} filter
 * @returns {Promise<Array>}
 */
export async function getStudents(filter = '') {
    await simulateNetworkDelay(250);
    
    const lowerCaseFilter = filter.toLowerCase();
    
    const filteredData = _mockStudentData.filter(student => {
        return (
            student.nome.toLowerCase().includes(lowerCaseFilter) ||
            student.turma.toLowerCase().includes(lowerCaseFilter) ||
            student.matricula.includes(lowerCaseFilter)
        );
    });
    
    return Promise.resolve(filteredData);
}

/**
 * @param {object} studentData
 * @returns {Promise<object>}
 */
export async function addStudent(studentData) {
    await simulateNetworkDelay(500);
    
    _mockStudentData.push(studentData);
    
    return Promise.resolve(studentData);
}

/**
 * @param {string} studentId
 * @returns {Promise<boolean>}
 */
export async function deleteStudent(studentId) {
    await simulateNetworkDelay(400);
    
    _mockStudentData = _mockStudentData.filter(student => student.matricula !== studentId);
    
    return Promise.resolve(true);
}

export async function getTeachers() {
    return new Promise(resolve => {
        setTimeout(() => resolve(professoresMock), 300);
    });
}

export async function addTeacher(teacher) {
    return new Promise(resolve => {
        setTimeout(() => {
            professoresMock.push(teacher);
            resolve(teacher);
        }, 300);
    });
}

export async function deleteTeacher(matricula) {
    return new Promise(resolve => {
        setTimeout(() => {
            professoresMock = professoresMock.filter(t => t.matricula !== matricula);
            resolve();
        }, 300);
    });
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

export async function getStudentGrades() {
    return new Promise(resolve => {
        setTimeout(() => resolve([
            { materia: 'Matemática', n1_n1: 8.0, n1_n2: 7.5, n1_ativ: 9.0, n2_n1: 6.5, n2_n2: 7.0, n2_ativ: 8.0 },
            { materia: 'Português', n1_n1: 9.0, n1_n2: 8.5, n1_ativ: 10.0, n2_n1: 9.0, n2_n2: 9.5, n2_ativ: 9.0 },
            { materia: 'História', n1_n1: 7.0, n1_n2: 6.5, n1_ativ: 8.0, n2_n1: 7.5, n2_n2: 8.0, n2_ativ: 7.0 },
            { materia: 'Geografia', n1_n1: 8.5, n1_n2: 8.0, n1_ativ: 9.0, n2_n1: 8.0, n2_n2: 7.5, n2_ativ: 8.5 },
            { materia: 'Ciências', n1_n1: 6.0, n1_n2: 5.5, n1_ativ: 7.0, n2_n1: 7.0, n2_n2: 6.5, n2_ativ: 8.0 },
        ]), 400);
    });
}

/**
 * @returns {Promise<Array>}
 */
export async function getAbsenceData() {
    await simulateNetworkDelay(300);
    return Promise.resolve(_mockAbsenceData);
}

export async function getClasses() {
    return new Promise(resolve => {
        setTimeout(() => resolve(['9º Ano A', '9º Ano B', '1º Ano EM', '2º Ano EM', '3º Ano EM']), 200);
    });
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

export async function getSubjectsList() {
    return new Promise(resolve => {
        setTimeout(() => resolve([
            "Matemática", "Português", "História", "Geografia", "Ciências", "Inglês"
        ]), 300);
    });
}

export async function getSubjectContent(subjectName) {
    await simulateNetworkDelay(300);
    return Promise.resolve(_mockMateriasContent[subjectName] || []);
}

export async function uploadStudentAssignment(assignmentId, file) {
    await simulateNetworkDelay(1000);
    console.log(`Arquivo ${file.name} enviado para a atividade ${assignmentId}`);
    return Promise.resolve(true);
}

export async function addTopicToSubject(subjectName, topicTitle) {
    await simulateNetworkDelay(400);

    if (!_mockMateriasContent[subjectName]) {
        _mockMateriasContent[subjectName] = [];
    }

    const newTopic = {
        id: Date.now(),
        titulo: topicTitle,
        itens: []
    };

    _mockMateriasContent[subjectName].push(newTopic);
    return Promise.resolve(newTopic);
}

export async function addSubjectResource(materia, moduloId, recurso) {
    await simulateNetworkDelay(800);

    const modules = _mockMateriasContent[materia];
    if (!modules) return Promise.reject("Matéria não encontrada");

    const topic = modules.find(m => m.id === Number(moduloId));
    if (!topic) return Promise.reject("Módulo não encontrado");

    const newItem = {
        id: Date.now(),
        type: recurso.type,
        nome: recurso.title,
        desc: recurso.desc,
        url: recurso.url,
        ...(recurso.type === 'assignment' ? { status: 'Pendente' } : {})
    };

    topic.itens.push(newItem);
    return Promise.resolve({ success: true });
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
 * @param {string} subjectName
 * @param {number} topicId
 * @param {number} itemId
 * @returns {Promise<boolean>}
 */
export async function deleteMaterialFromSubject(subjectName, topicId, itemId) {
    await simulateNetworkDelay(400);
    
    const subjectModules = _mockMateriasContent[subjectName];
    if (!subjectModules) return Promise.reject("Matéria não encontrada");

    const topic = subjectModules.find(m => m.id === Number(topicId));
    
    if (topic) {
        const itemIndex = topic.itens.findIndex(item => item.id === Number(itemId));
        if (itemIndex > -1) {
            topic.itens.splice(itemIndex, 1);
            return Promise.resolve(true);
        }
    }
    
    return Promise.reject("Item não encontrado");
}

/**
 * @param {string} subjectName
 * @param {number} topicId
 * @param {number} itemId
 * @param {object} newData
 * @returns {Promise<boolean>}
 */
export async function editMaterialFromSubject(subjectName, topicId, itemId, newData) {
    await simulateNetworkDelay(500);
    
    const subjectModules = _mockMateriasContent[subjectName];
    if (!subjectModules) return Promise.reject("Matéria não encontrada");

    const topic = subjectModules.find(m => m.id === Number(topicId));
    
    if (topic) {
        const item = topic.itens.find(item => item.id === Number(itemId));
        if (item) {
            item.nome = newData.nome || item.nome;
            item.desc = newData.desc || item.desc;
            item.url = newData.url || item.url;
            item.type = newData.type || item.type;
            return Promise.resolve(true);
        }
    }
    
    return Promise.reject("Item não encontrado");
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