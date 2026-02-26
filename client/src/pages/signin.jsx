import React, { useState } from 'react';
//const dbms = require("./dbms.js");

function Signin() {
return (
<div>
<p>Enter log-in info</p>
<button onClick={login_button}></button>
</div>
)
}

const login_button = () => {
alert("hello");
};

export default Signin