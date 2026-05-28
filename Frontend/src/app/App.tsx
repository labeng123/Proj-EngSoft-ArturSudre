import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/ThemeProvider';
import ThemeToggle from './components/ThemeToggle';
import { TopBar } from './components/TopBar';
import Projects from './pages/Projects';
import Dashboard from './pages/Dashboard';

export default function App() {
  useEffect(() => {
    document.title = "Modulo 2: Ingestão"; 
  }, []);
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <TopBar />
          <div className="flex-grow">
            <Toaster position="top-right" richColors theme="dark" />
            <ThemeToggle />
            <Routes>
              <Route path="/" element={<Projects />} />
              <Route path="/dashboard/:projetoId" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
