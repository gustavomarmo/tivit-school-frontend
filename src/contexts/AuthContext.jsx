import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser } from '../services/api';
import { decodeToken, mapRole } from '../utils/tokenUtils';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [userRole, setUserRole] = useState(null);
    const [user, setUser] = useState(null);
    const [loadingSession, setLoadingSession] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = decodeToken(token);
            if (decoded) {
                setUser({
                    id: decoded.id,
                    name: decoded.name,
                    email: decoded.email,
                    fotoUrl: localStorage.getItem('fotoUrl') ?? null,
                });
                setUserRole(mapRole(decoded.role));
            } else {
                localStorage.clear();
            }
        }
        setLoadingSession(false);
    }, []);

    async function signIn(email, senha) {
        const data = await loginUser(email, senha);

        localStorage.setItem('token', data.token);
        if (data.fotoUrl) localStorage.setItem('fotoUrl', data.fotoUrl);

        const decoded = decodeToken(data.token);
        const role = mapRole(decoded?.role ?? data.perfil);

        setUser({
            id: decoded?.id,
            name: data.nome,
            email: data.email,
            fotoUrl: data.fotoUrl ?? null,
        });
        setUserRole(role);

        return role;
    }

    function logout() {
        localStorage.clear();
        setUserRole(null);
        setUser(null);
        window.location.href = '/login';
    }

    return (
        <AuthContext.Provider value={{ userRole, user, signIn, logout, loadingSession }}>
            {children}
        </AuthContext.Provider>
    );
}