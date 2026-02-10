import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null );
    const [user, setUser] = useState({
        name: 'Gustavo Marmo',
        photo: 'IMG_8792.jpg'
    });

    useEffect(() => {
        if (userRole) {
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('userName', user.name);
        } else {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
        }
    }, [userRole, user]);

    function signIn(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (password === '123456') {
                    if (email.includes('aluno')) {
                        setUser({ name: 'Gustavo Marmo', photo: 'IMG_8792.jpg' });
                        setUserRole('aluno');
                        resolve('aluno');
                    } else if (email.includes('prof')) {
                        setUser({ name: 'Prof. Silva', photo: 'IMG_5116.jpg' });
                        setUserRole('professor');
                        resolve('professor');
                    } else if (email.includes('coord')) {
                        setUser({ name: 'Coord. Ana', photo: 'Logo Edu Connect.png' });
                        setUserRole('coordenador');
                        resolve('coordenador');
                    } else {
                        reject('Usuário não encontrado. Use "aluno", "prof" ou "coord" no email.');
                    }
                } else {
                    reject('Senha incorreta (Dica: é 123456)');
                }
            }, 500);
        });
    }

    function logout() {
        setUserRole(null);
        setUser(null);
        window.location.href = "/login";
    }

    return (
        <AuthContext.Provider value={{ userRole, user, signIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
}