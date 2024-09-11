import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../../utils/mutations';
import CookieAuth from '../../utils/auth';
import '../../../public/css/style.css';

export default function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState({ usernameOrEmail: '', password: '' });
  const [loginUser] = useMutation(LOGIN);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setLogin((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  async function handleSubmit() {
    try {
      const { data } = await loginUser({
        variables: {
          usernameOrEmail: login.usernameOrEmail,
          password: login.password,
        },
      });

      if (data.login.token) {
        console.log('Login successful:', data);
      }

      CookieAuth.login(JSON.stringify(data.login.token));
      if (CookieAuth.getToken()) {
        navigate('/');
      }
    } catch (error) {
      setErrorMessage('Error: Could not login. Please check your credentials.');
      console.error('Login error:', error);
    }
  }

  return (
    <div onKeyDown={handleKeyDown} className='login'>
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
      <button onClick={handleSubmit}>Submit</button>
      <div>
        Don't have an account? <a onClick={() => navigate('/signup')}>Sign Up</a>
      </div>
      {errorMessage && <h2>{errorMessage}</h2>}
    </div>
  );
}