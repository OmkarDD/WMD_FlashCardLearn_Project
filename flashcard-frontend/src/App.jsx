import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StudyRoom from './pages/StudyRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/deck/:id" element={<StudyRoom />} />
      </Routes>
    </Router>
  );
}

export default App;