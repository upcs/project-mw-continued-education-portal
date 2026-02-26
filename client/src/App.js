import logo from './logo.svg';
import './App.css';

import WelcomePage from './pages/WelcomePage';
import Upload from './pages/UploadPage';
import ProgressTracker from './pages/ProgressTracker';
import ModuleView from './pages/moduleView';
import SearchResults from './pages/SearchResults';
import Dashboard from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import Login from './pages/login';
import Signin from './pages/signin';

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
          <Route path="/module-view" element={<ModuleView/>}/>
          <Route path="/results" element={<SearchResults/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/profile" element={<ProfilePage/>}/>
          <Route path="/settings" element={<SettingsPage/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signin" element={<Signin/>}/>
        </Routes>
      </Router> 
    </div>
  );
}

export default App;
