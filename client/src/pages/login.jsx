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

    // Use $.post to send login data to the backend
    $.post(
      'http://localhost:5000/login', // Backend URL
      {
        username: username,
        password: password
      },
      (data, status) => {
        if (status === 'success') {
          alert('Login Successful');
        } else {
          alert('Login Failed');
        }
      }
    ).fail((error) => {
      console.error('Error logging in:', error);
      alert('Error logging in, please try again later');
    });
  };

  return (
    <div>
      <p>Enter login info</p>
      <input
        type="text"
        value={username}
        onChange={handleUsernameChange}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Password"
      />
      <button onClick={loginButton}>Login</button>
    </div>
  );
}

export default Login;