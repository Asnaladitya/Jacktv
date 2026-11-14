import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Detail from './pages/Detail';
import NotFound from './pages/NotFound';
import { LangProvider } from './context/LangContext';

function App() {
  return (
    <LangProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* New slug URL format */}
          <Route path="/:langCode/:type/:id" element={<Detail />} />
          {/* Catch-all → NotFound */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </Router>
    </LangProvider>
  );
}

export default App;
