import React, { useState } from 'react';
import '../../../public/css/style.css';

export default function Login() {
  const [login, setLogin] = useState({ usernameOrEmail: '', password: '' });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setLogin((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className='login'>
      <h1>Login</h1>
      <div>Email or Username:</div>
      <input 
        type="text" 
        name="usernameOrEmail" 
        value={login.usernameOrEmail} 
        onChange={handleInputChange} 
      />
      <div>Password</div>
      <input 
        type="password" 
        name="password" 
        value={login.password} 
        onChange={handleInputChange} 
      />
      <div>Dont't have an account?<a href="signup">Signup</a></div>
    </div>
  );
};