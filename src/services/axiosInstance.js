import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const mensagemServidor = error.response?.data?.mensagem
            ?? error.response?.data?.message
            ?? null;

        if (status === 401) {
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(error);
        }

        const mensagensPadrao = {
            400: 'Requisição inválida. Verifique os dados enviados.',
            403: 'Você não tem permissão para realizar esta ação.',
            404: 'O recurso solicitado não foi encontrado.',
            409: 'Conflito: o registro já existe ou está em uso.',
            422: 'Os dados enviados são inválidos.',
            500: 'Erro interno do servidor. Tente novamente em instantes.',
        };

        const mensagemFinal = mensagemServidor
            ?? mensagensPadrao[status]
            ?? 'Ocorreu um erro inesperado. Tente novamente.';

        return Promise.reject(new Error(mensagemFinal));
    }
);

export default api;