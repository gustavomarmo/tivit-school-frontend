export function decodeToken(token) {
    try {
        const base64Payload = token.split('.')[1];
        const decoded = JSON.parse(atob(base64Payload));

        return {
            id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
            name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
            email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
            role: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'],
        };
    } catch {
        return null;
    }
}

export function mapRole(backendRole) {
    const map = {
        'Aluno': 'aluno',
        'Professor': 'professor',
        'Coordenador': 'coordenador'
    };
    return map[backendRole] ?? 'aluno';
}