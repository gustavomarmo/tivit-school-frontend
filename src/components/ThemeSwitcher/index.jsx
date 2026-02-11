import { useTheme } from '../../hooks/useTheme';
import { Button } from '../Button';

export function ThemeSwitcher() {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <Button 
            variant="icon" 
            onClick={toggleTheme} 
            title={isDarkMode ? "Modo Escuro Ativo" : "Modo Claro Ativo"}
            style={{ fontSize: '1.2rem', color: '#ffffff' }}
        >
            <i className={isDarkMode ? "fa-solid fa-moon" : "fa-solid fa-sun"}></i>
        </Button>
    );
}