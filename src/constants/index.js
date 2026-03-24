// ============================
// ROLES DE USUÁRIO
// ============================
export const ROLES = {
    ALUNO: 'aluno',
    PROFESSOR: 'professor',
    COORDENADOR: 'coordenador',
};

// ============================
// STATUS DE PESSOA
// ============================
export const STATUS = {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
};

// ============================
// STATUS DE MATRÍCULA
// ============================
export const MATRICULA_STATUS = {
    ANALISE_COORD: 'ANALISE_COORD',
    AGUARDANDO_PAGAMENTO: 'AGUARDANDO_PAGAMENTO',
    ANALISE_PIX: 'ANALISE_PIX',
    CONCLUIDO: 'CONCLUIDO',
    REJEITADO: 'REJEITADO',
};

export const MATRICULA_STATUS_LABEL = {
    ANALISE_COORD: 'Aguardando Aprovação de Docs',
    AGUARDANDO_PAGAMENTO: 'Aguardando Aluno Pagar',
    ANALISE_PIX: 'Aguardando Aprovação de PIX',
    CONCLUIDO: 'Matriculado',
};

// ============================
// TIPOS DE MATERIAL
// ============================
export const MATERIAL_TIPO = {
    LINK: 'link',
    FILE: 'file',
    ASSIGNMENT: 'assignment',
};

export const MATERIAL_ICON = {
    link: 'fa-video',
    file: 'fa-file-lines',
    assignment: 'fa-clipboard-list',
};

// ============================
// TIPOS DE NOTIFICAÇÃO
// ============================
export const NOTIFICACAO_TIPO = {
    SUCCESS: 'success',
    WARNING: 'warning',
    INFO: 'info',
    ERROR: 'error',
};

export const NOTIFICACAO_ICON = {
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info',
    error: 'fa-circle-exclamation',
};

// ============================
// HORÁRIOS DE AULA
// ============================
export const HORARIOS_AULA = [
    { value: '07:30', label: '07:30 - 08:20 (1º Aula)' },
    { value: '08:20', label: '08:20 - 09:10 (2º Aula)' },
    { value: '09:10', label: '09:10 - 10:00 (3º Aula)' },
    { value: '10:20', label: '10:20 - 11:10 (4º Aula)' },
];

// ============================
// SÉRIES DISPONÍVEIS
// ============================
export const SERIES_DISPONIVEIS = [
    '1º Ano do Ensino Médio',
    '2º Ano do Ensino Médio',
    '3º Ano do Ensino Médio',
];

// ============================
// TURNOS DISPONÍVEIS
// ============================
export const TURNOS_DISPONIVEIS = [
    'Manhã',
    'Tarde',
    'Noite',
];