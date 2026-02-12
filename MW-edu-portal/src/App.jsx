import SearchBar from './components/searchBar.jsx'
import WelcomeMessage from './components/welcomeMessage.jsx'

import './App.css';
import FormButtons from './components/FormButtons.jsx';
import SubjectButtons from './components/SubjectButtons.jsx';

function App() {
  return (
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
  );
}

export default App
