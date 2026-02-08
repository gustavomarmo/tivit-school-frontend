import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'aluno');
    const [user, setUser] = useState({
        name: 'Gustavo Marmo',
        photo: 'IMG_8792.jpg'
    });

    useEffect(() => {
        localStorage.setItem('userRole', userRole);
    }, [userRole]);

    function login(role) {
        setUserRole(role);
    }

    function logout() {
        localStorage.removeItem('userRole');
        setUserRole(null);
        window.location.reload();
    }

    return (
        <AuthContext.Provider value={{ userRole, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}