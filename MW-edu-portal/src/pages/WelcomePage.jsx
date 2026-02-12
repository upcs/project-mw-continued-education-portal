import SearchBar from '../components/searchBar.jsx'
import WelcomeMessage from '../components/welcomeMessage.jsx'
import FormButtons from '../components/FormButtons.jsx';
import SubjectButtons from '../components/SubjectButtons.jsx';
import './WelcomePage.css';
import '../App.css';
import Button from "../components/Button.jsx";
import { Link } from 'react-router-dom';

function WelcomePage() {
  return (
    <div className="welcomePage">
      
      <div className='uploadbutton-container'>
        <Link to = "/upload" className='uploadButton'>
          <Button text = "Upload"/>
        </Link>
      </div>

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

export default WelcomePage;