import WelcomePage from './pages/WelcomePage';
import Upload from './pages/UploadPage';
import ProgressTracker from './pages/ProgressTracker';
import './App.css';

import { HashRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage/>}/>
        <Route path="/upload" element={<Upload/>}/>
        <Route path="/progress-tracker" element={<ProgressTracker/>}/>
      </Routes>
    </Router> 

  );
}

export default App
