import '../css/NavigationBar.css';
import { Link } from 'react-router-dom';

function NavigationBar() {
  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <button className="btn">to-do</button>
        <Link to = "/">
          <button className="btn">Back</button>
        </Link>
      </div>
      <div className="breadcrumbs">
       <p> a \ b \ c \ Navi. Bar </p>
      </div>
      <button className="btn">Quiz</button>
    </nav>
  );
};

export default NavigationBar;