// Mapa de rotas (URL → página). HashRouter usa URLs como /#/secplus,
// o que funciona em qualquer hospedagem estática sem configurar o servidor.
import { HashRouter, Routes, Route } from 'react-router-dom'
import { StudyProvider } from './state/StudyContext.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SecurityPlus from './pages/SecurityPlus.jsx'
import LessonPage from './pages/LessonPage.jsx'
import PracticePage from './pages/PracticePage.jsx'
import Ielts from './pages/Ielts.jsx'
import IeltsReading from './pages/IeltsReading.jsx'
import Library from './pages/Library.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <StudyProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="secplus" element={<SecurityPlus />} />
            <Route path="secplus/lesson/:lessonId" element={<LessonPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="ielts" element={<Ielts />} />
            <Route path="ielts/reading/:setId" element={<IeltsReading />} />
            <Route path="library" element={<Library />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </StudyProvider>
  )
}
