import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Detail from './pages/Detail';
import { LangProvider } from './context/LangContext';

function App() {
  return (
    <LangProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detail/:type/:id" element={<Detail />} />
        </Routes>
      </Router>
    </LangProvider>
  );
}

export default App;
