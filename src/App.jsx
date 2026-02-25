import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { EsqueciSenha } from './pages/EsqueciSenha';
import { VerificacaoOTP } from './pages/VerificacaoOTP';
import { Matricula } from './pages/Matricula';
import { AprovacaoMatriculas } from './pages/AprovacaoMatriculas';


function PrivateRoute({ children }) {
    const { userRole, loadingSession } = useContext(AuthContext);

    if (loadingSession) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Carregando...
        </div>;
    }
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
              <Route path="/esqueci-minha-senha" element={<EsqueciSenha />} />
              <Route path="/esqueci-minha-senha/codigo-otp" element={<VerificacaoOTP />} />
              <Route path="/matricula" element={<Matricula />} />

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
                <Route path="aprovacao-matriculas" element={<AprovacaoMatriculas />} />
              </Route>

            </Routes>
          </BrowserRouter>
        </DialogProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;