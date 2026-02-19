{/* Written by: Becca Biukoto */}

import './UploadPage.css';
import { Link } from 'react-router-dom';

function UploadPage() 
{
    return (
    <div className="container">
        {/* Sidebar */}

        <div className="sidebar">
            <h2>UPlendo</h2>
            <a href="#">Dashboard</a>
            <a href="#">Profile</a>
            <a href="#"><b>Upload</b></a>
            <Link to="/progress-tracker">Progress Tracker</Link>
            <a href="#">Settings</a>
            <Link to="/">Home</Link>
        </div>

        {/* Main */}

        <div className="main">
            <h3>1. Upload Material</h3>
            <input type="file" id="fileInput" hidden />

            <div className="drop-box" id="dropBox">
                ⬆ Drag &amp; Drop or Click
            </div>

            <p id="fileName" />
            <h3>2. Choose Filters</h3>

            <div className="filters-box">
                <p>Filter Option 1</p>
                <p>Filter Option 2</p>
                <p>Filter Option 3</p>
            </div>

            <h3>3. Upload</h3>
            <button id="uploadBtn">UPLOAD ⬇</button>
        </div>
    </div>
    )   
};

export default UploadPage;
