import logo from './logo.svg';
import './App.css';

import WelcomePage from './pages/WelcomePage';
import Upload from './pages/UploadPage';
import ProgressTracker from './pages/ProgressTracker';

import { HashRouter as Router, Routes, Route } from 'react-router-dom';

function App() 
{
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage/>}/>
          <Route path="/upload" element={<Upload/>}/>
          <Route path="/progress-tracker" element={<ProgressTracker/>}/>
        </Routes>
      </Router> 
    </div>
  );
}

export default App;
