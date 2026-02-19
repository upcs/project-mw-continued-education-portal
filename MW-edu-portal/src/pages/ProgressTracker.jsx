/* Written by: Becca Biukoto */

import './ProgressTracker.css';
import { Link } from 'react-router-dom';

function ProgressTracker() {
    return (
        <div className="container">
            {/* Sidebar */}
            <div className="sidebar">
                <h2>UPlendo</h2>
                <a href="#">Dashboard</a>
                <a href="#">Profile</a>
                <Link to="/upload">Upload</Link>
                <a href="#"><b>Progress Tracker</b></a>
                <a href="#">Options</a>
                <Link to="/">Home</Link>
            </div>

            {/* Main */}
            <div className="main">
                <h1>Progress Tracker</h1>
                {/* Completion Bar */}

                <div className="progress-container">
                    <div className="progress-label">
                        Completion: <span id="percentText">0%</span>
                    </div>

                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" id="progressFill" />
                    </div>
                </div>

                {/* Items */}
                <div className="progress-item">
                    <div className="left">
                        <div className="circle" />
                        <p>Material 1</p>
                    </div>

                    <select className="status">
                        <option value={1}>Complete</option>
                        <option value={0}>Incomplete</option>
                    </select>
                </div>

                <div className="progress-item">
                    <div className="left">
                        <div className="circle" />
                        <p>Material 2</p>
                    </div>

                    <select className="status">
                        <option value={1}>Complete</option>
                        <option value={0}>Incomplete</option>
                    </select>
                </div>

                <div className="progress-item">
                    <div className="left">
                        <div className="circle" />
                        <p>Material 3</p>
                    </div>

                    <select className="status">
                        <option value={1}>Complete</option>
                        <option value={0}>Incomplete</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default ProgressTracker;