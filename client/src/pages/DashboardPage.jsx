import './DashboardPage.css';
import { Link } from 'react-router-dom';

function DashboardPage() {

    return (
        <div className="container">
            {/* Sidebar */}
            <div className="sidebar">
                <h2>UPlendo</h2>
                <Link to="/dashboard"><b>Dashboard</b></Link>
                <Link to="/profile">Profile</Link>
                <Link to="/upload">Upload</Link>
                <Link to="/progress-tracker">Progress Tracker</Link>
                <Link to="/settings">Settings</Link>
                <Link to="/">Home</Link>
            </div>

            {/* Main */}
            <div className="main">
                <h1>Dashboard</h1>
                {/* Completion Bar */}

                <div className="to-do-list">
                    <h2>To-Do List</h2>
                    <ul>
                        <li>Complete Profile Setup</li>
                        <li>Upload New Material</li>
                        <li>Review Progress Tracker</li>
                    </ul>
                </div>
            </div>
        </div>
    )
};

export default DashboardPage;