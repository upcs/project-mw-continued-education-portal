import './SettingsPage.css';
import { Link } from 'react-router-dom';

function SettingsPage() {
    return (
        <div className="container">
            {/* Sidebar */}
            <div className="sidebar">
                <h2>UPlendo</h2>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/upload">Upload</Link>
                <Link to="/progress-tracker">Progress Tracker</Link>
                <Link to="/settings"><b>Settings</b></Link>
                <Link to="/">Home</Link>
            </div>

            {/* Main */}
            <div className="main">
                <h1>Settings</h1>

                {/* Options */}
                <div className="options">
                    <p>Option 1</p>
                    <p>Option 2</p>
                    <p>Option 3</p>
                </div>
                
            </div>
        </div>
    )
}

export default SettingsPage;