import './ProfilePage.css';
import { Link } from 'react-router-dom';

function ProfilePage() {

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

                <div className="profile-info">
                    <p><b>Name:</b> John Doe</p>
                    <p><b>Email:</b> john.doe@example.com</p>
                </div>

                
            </div>
        </div>
    )
};

export default ProfilePage;