//import React, { useState } from 'react';

//function Login() {
//return (
//<div>
//<p>Enter log-in info</p>
//<input type="text"></input>
//<input type="password"></input>
//<button onClick={login_button}></button>
//</div>
//)
//}

//const login_button = () => {
//alert("hello");
//};

//export default Login

import React, { useState } from 'react';
import './Login.css'
import $ from 'jquery'; // Import jQuery

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handle input change for username
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  // Handle input change for password
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  // Handle login button click
  const loginButton = () => {
    // Make sure the username and password are not empty
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }
	alert(username + " " + password);
    // Use $.post to send login data to the backend
    $.post(
     'http://cs341s26mwed.campus.up.edu:5000/login', //'http://localhost:5000/login', // Backend URL
      {
        username: username,
        password: password
      },
      function(data) {
	alert("login");
      });
  };

  return (
    <div className='login-container'>
      <p>Enter login info</p>
      <input className='usernameBar'
        type="text"
        value={username}
        onChange={handleUsernameChange}
        placeholder="Username"
      />
      <input
        type="password" className='passwordBar'
        value={password}
        onChange={handlePasswordChange}
        placeholder="Password"
      />
      <button onClick={loginButton}>Login</button>
    </div>
  );
}

export default Login;
