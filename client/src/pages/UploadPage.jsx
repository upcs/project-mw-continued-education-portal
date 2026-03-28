import './UploadPage.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

{/* Written by: Becca Biukoto */ }

function UploadPage() {
    const [file, setFile] = useState("");
    const [fileName, setFileName] = useState('Choose File');
    const [uploadedFile, setUploadedFile] = useState({});

    const onChange = e => {
        setFile(e.target.files[0]);
        setFileName(e.target.files[0].name);
    }

    const onSubmit = async e => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('http://localhost:3000/uploads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const { fileName, filePath } = res.data;

            setUploadedFile({ fileName, filePath })
        }

        catch (err) {
            if (err.response.status === 500) {
                console.log('Problem with Server');
            }

            else {
                console.log(err.response.data.msg);
            }
        }
    }

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
                <input type="file" id="fileInput" style={{ display: 'none' }}
                    onChange={onChange} />

                <label className="drop-box" id="dropBox" htmlFor="fileInput">

                    { /* {file ? <span>{`Selected File: ${file.name}`}</span> : <span>⬆ Drag &amp; Drop or Click</span>} */}
                    {fileName}

                </label>

                <h3>2. Choose Filters</h3>

                <div className="filters-box">
                    <p>Filter Option 1</p>
                    <p>Filter Option 2</p>
                    <p>Filter Option 3</p>
                </div>

                <h3>3. Upload</h3>
                <button id="uploadBtn" onClick={onSubmit}> UPLOAD ⬇ </button>
            </div>
        </div>
    )
};

export default UploadPage;
