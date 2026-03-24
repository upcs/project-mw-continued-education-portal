import React, { useState } from 'react';
import './SignIn.css'
import $ from 'jquery';
//const dbms = require("./dbms.js");

function Signup() 
{
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [whatsapp, setWhatsapp] = useState("");
const [photo, setPhoto] = useState(null);

const signup_button = () =>
{
      $.post(
     'http://cs341s26mwed.campus.up.edu:3000/signup',
      {
        username: username,
        password: password,
        name: name,
        email: email,
        whatsapp: whatsapp,
        photo: photo
      },
      function(data) {
        if (data.error == "none") {alert("signup");}
              else {alert(data.error);}
      });

};


    return (
        <div >
            <h1>Enter log-in info</h1>
<div>
  <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
  <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
  <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
  <input type="text" placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
  <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
</div>
            <button onClick={signup_button}></button>
        </div>
    )
}

export default Signup
