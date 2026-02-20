
function NavigationBar() {
  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <button className="btn">to-do</button>
        <button className="btn">Back</button>
      </div>
      <div className="breadcrumbs">
        a \ b \ c \ Navi. Bar
      </div>
      <button className="btn">take a quiz</button>
    </nav>
  );
};

export default NavigationBar;