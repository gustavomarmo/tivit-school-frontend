import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DialogProvider } from './contexts/DialogContext';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Calendario } from './pages/Calendario';
import { Materias } from './pages/Materias';
import { Login } from './pages/Login';
import { Alunos } from './pages/Alunos';
import { Professores } from './pages/Professores';
import { Boletim } from './pages/Boletim';
import { Frequencia } from './pages/Frequencia';
import { Notas } from './pages/Notas';
import { useContext } from 'react';


function PrivateRoute({ children }) {
  const { userRole } = useContext(AuthContext);
  return userRole ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DialogProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/" element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="alunos" element={<Alunos />} />
                <Route path="calendario" element={<Calendario />} />
                <Route path="materias" element={<Materias />} />
                <Route path="professores" element={<Professores />} />
                <Route path="boletim" element={<Boletim />} />
                <Route path="frequencia" element={<Frequencia />} />
                <Route path="notas" element={<Notas />} />
              </Route>

            </Routes>
          </BrowserRouter>
        </DialogProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;