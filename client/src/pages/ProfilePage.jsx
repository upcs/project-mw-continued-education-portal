import './ProfilePage.css';
import { Link } from 'react-router-dom';
import $ from 'jquery';

function ProfilePage() {


  const profileButton = () => {
    //TODO: replace this with $docuemtn get element search field val
    var username = "temporary username";
    // Make sure the username and password are not empty
    if (!username) {
      alert("please enter a username");
      return;
    }
        alert(username);
    // Use $.post to send login data to the backend
    $.post(
     'http://cs341s26mwed.campus.up.edu:3000/profile',
      {
        username: username,
      },
      function(data) {
        alert(data.error);
      });
  };

    return (
        <div className="container">
            {/* Sidebar */}
            <div className="sidebar">
                <h2>UPlendo</h2>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/profile"><b>Profile</b></Link>
                <Link to="/upload">Upload</Link>
                <Link to="/progress-tracker">Progress Tracker</Link>
                <Link to="/settings">Settings</Link>
                <Link to="/">Home</Link>
            </div>

            {/* Main */}
            <div className="main">
                
                <h1>Profile</h1>
                {/* Completion Bar */}
	     <input type="password"></input>

                <div className="profile-info">
                    <p><b>Name:</b> John Doe</p>
                    <p><b>Email:</b> john.doe@example.com</p>
                </div>

                
            </div>
        </div>
    )
};

export default ProfilePage;
