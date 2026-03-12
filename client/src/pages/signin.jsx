import React, { useState } from 'react';
import './SignIn.css'
//const dbms = require("./dbms.js");

function Signin() 
{
    return (
        <div >
            <h1>Enter log-in info</h1>

            <button onClick={login_button}></button>
        </div>
    )
}

const login_button = () => 
{
    alert("hello");
};

export default Signin