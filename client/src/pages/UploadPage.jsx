import './UploadPage.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

{/* Written by: Becca Biukoto */}

function UploadPage() 
{
    const [file, setFile] = useState();

    const upload = () => {
        const formData = new FormData();
        formData.append('file', file);
        axios.post('/upload', formData)
            .then(response => {
                alert('File uploaded successfully!');
            })
            .catch(error => {
                alert('Error uploading file');
            });
    };

    return (
    <div className="container">
        {/* Sidebar */}

        <div className="sidebar">
            <h2>UPlendo</h2>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/upload"><b>Upload</b></Link>
            <Link to="/progress-tracker">Progress Tracker</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/">Home</Link>
        </div>

        {/* Main */}

        <div className="main">
            <h3>1. Upload Material</h3>
            <input type="file" id="fileInput" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])}/>

            <label className="drop-box" id="dropBox" htmlFor="fileInput">

                {file ? <span>{`Selected File: ${file.name}`}</span> : <span>⬆ Drag &amp; Drop or Click</span>}
                
            </label>
            
            <h3>2. Choose Filters</h3>

            <div className="filters-box">
                <p>Filter Option 1</p>
                <p>Filter Option 2</p>
                <p>Filter Option 3</p>
            </div>

            <h3>3. Upload</h3>
            <button id="uploadBtn" onClick={upload}>UPLOAD ⬇</button>
        </div>
    </div>
    )   
};

export default UploadPage;
