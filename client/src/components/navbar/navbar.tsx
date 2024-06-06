import '../../../public/css/style.css';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CookieAuth from '../../utils/auth';

export default function Navbar() {
    const [input, setInput] = useState<JSX.Element>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!CookieAuth.getToken()) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const updateInput = () => {
            if (window.innerWidth > 850) {
                setInput(<input type="text" />);
            } else {
                setInput(<div className='searchSmall'></div>);
            }
        };

        updateInput();

        window.addEventListener('resize', updateInput);

    }, []);

    const handleMeClick = () => {
        if (CookieAuth.getToken()) {
            navigate('/me');
        } else {
            navigate('/login');
        }
    };

    return (
        <>
            <header>
                <ul>
                    <li className='logo'>Logo</li>
                    <li>
                        <Link className='navLinks' to="/main">Home</Link>
                    </li>
                    {input}
                    <li onClick={handleMeClick}>Me</li>
                    <li>
                        <img src="../../../public/images/settings.svg" alt="Settings" height="60px" />
                    </li>
                </ul>
            </header>
            <p className='back'></p>
        </>
    );
}