import '../css/NavigationBar.css';

function NavigationBar() {
  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <button className="btn">Progress</button>
        <button className="btn">Home</button>
      </div>
      <div className="breadcrumbs">
       <p> a \ b \ c \ Navi. Bar </p>
      </div>
      <button className="btn">Quiz</button>
    </nav>
  );
};

export default NavigationBar;