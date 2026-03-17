import React, { useState } from 'react';
import './SignIn.css'
import $ from 'jquery';
//const dbms = require("./dbms.js");

function Signup() 
{
    return (
        <div >
            <h1>Enter log-in info</h1>

            <button onClick={signup_button}></button>
        </div>
    )
}

const signup_button = () => 
{
      $.post(
     'http://cs341s26mwed.campus.up.edu:3000/signup',
      {
        username: "admo",
        password: "123"
      },
      function(data) {
        if (data.error == "none") {alert("signup");}
              else {alert(data.error);}
      });

};

export default Signup
