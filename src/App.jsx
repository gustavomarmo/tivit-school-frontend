import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Calendario } from './pages/Calendario';
import { Materias } from './pages/Materias';
import { Login } from './pages/Login';
import { Alunos } from './pages/Alunos';
import { Professores } from './pages/Professores';
import { useContext } from 'react';


function PrivateRoute({ children }) {
  const { userRole } = useContext(AuthContext);
  return userRole ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
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
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;