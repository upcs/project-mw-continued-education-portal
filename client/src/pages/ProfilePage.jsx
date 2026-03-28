import './ProfilePage.css';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import React, { useState } from 'react';


function ProfilePage() {

  const [username, setUsername] = useState("");
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const [name, setName] = useState("test");
  const [email, setEmail] = useState("test");
  const [whatsapp, setWhatsapp] = useState("test");
  const [photo, setPhoto] = useState(null); // assuming photo is a file

  const handleNameChange = (event) => setName(event.target.value);
  const handleEmailChange = (event) => setEmail(event.target.value);
  const handleWhatsappChange = (event) => setWhatsapp(event.target.value);
  //const handlePhotoChange = (event) => setPhoto(event.target.files[0]);


  const profileButton = () => {
    // Make sure the username and is not empty
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
      function (data) {
        if (data[0].name === undefined) { alert("data undefined"); }
        else {
          //happy path
          //alert(data);
          setName(data[0].name);
          setWhatsapp(data[0].whatsapp);
          setEmail(data[0].email);
          //setPhoto(data[0].photo);
        }
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
        <input className='usernameBar'
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Username" />

        <button onClick={profileButton}>Search</button>



        <div className="profile-info">
          <p><b>Name:</b>{name}</p>
          <p><b>Email:</b>{email}</p>
          <p><b>Whatsapp:</b>{whatsapp}</p>
          <p><b>Photo:</b>{photo}</p>
        </div>


      </div>
    </div>
  )
};

export default ProfilePage;
