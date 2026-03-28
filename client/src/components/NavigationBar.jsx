import '../css/NavigationBar.css';
import { useState } from 'react'
import { Link } from 'react-router-dom';

function NavigationBar() {

  const [green, setGreen] = useState(false);

  const handleClick = () => {
    setGreen(!green);
  };

  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <button className="btn">to-do</button>

        <Link to="/">
          <button className="btn">Back</button>
        </Link>

      </div>

      <div className="breadcrumbs">
        <p> a \ b \ c \ Navi. Bar </p>
      </div>

      <div className="nav-buttons">
        <button className={green ? 'green-btn' : 'btn'} onClick={handleClick}>Done</button>

        <button className="btn">Quiz</button>
      </div>
    </nav>
  );
};

export default NavigationBar;