import '../../../public/css/style.css';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CookieAuth from '../../utils/auth';

export default function Navbar() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!CookieAuth.getToken()) {
            navigate('/login');
        }
    }, [navigate]);

    const handleMeClick = () => {
        if (CookieAuth.getToken()) {
            navigate('/me');
        } else {
            navigate('/login');
        }
    };

    return (
        <header>
            <ul>
                <li>Logo</li>
                <li>
                    <Link className='navLinks' to="/main">Home</Link>
                </li>
                <input type="text" />
                <li onClick={handleMeClick}>Me</li>
                <li>
                    <img src="../../../public/images/settings.svg" alt="Settings" height="60px" />
                </li>
            </ul>
        </header>
    );
}