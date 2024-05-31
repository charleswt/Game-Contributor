import React from 'react';

export default function Login(){
    return (
       <div className='login'>
        <div>Login</div>
        <div>Email or Username:</div>
        <input type="text" />
        <div>Password</div>
        <input type="password" />
       </div>
    )
}