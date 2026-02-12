import WelcomePage from './pages/WelcomePage';
import Upload from './pages/UploadPage';
import ProgressTracker from './pages/ProgressTracker';
import './App.css';

import { HashRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    /*
    <div className="welcomePage">
      <WelcomeMessage/>
      <SearchBar/>

      <h1 id="forms">Forms</h1>
      <FormButtons/>

      <h1 id="subjects">Subjects</h1>
      <SubjectButtons/>
      <SubjectButtons/>
      <SubjectButtons/>
    </div>
    */
    
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
