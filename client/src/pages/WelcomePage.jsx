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

      <div className='uploadButton-container'>
        <Link to="/profile" className='uploadButton'>
          <Button text="Profile" />
        </Link>

        <Link to="/login" className="uploadButton">
          <Button text="Login" />
        </Link>

        <Link to="/signup" className="signupButton">
          <Button text="Signup" />
        </Link>
      </div>

      <div className="welcomeBody">
        <WelcomeMessage />
        <SearchBar />

        <h1 id="forms">Forms</h1>
        <FormButtons />

        <h1 id="subjects">Subjects</h1>
        <SubjectButtons />
      </div>

    </div>
  );
}

export default WelcomePage;
