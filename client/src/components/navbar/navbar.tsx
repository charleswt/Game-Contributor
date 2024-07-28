import '../../../public/css/style.css';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CookieAuth from '../../utils/auth';

export default function Navbar() {
    const [input, setInput] = useState<JSX.Element>();
    const navigate = useNavigate();

    CookieAuth.checkExpiration()

    useEffect(() => {
        const updateInput = () => {
            if (window.innerWidth > 850) {
                setInput(<input type="text"/>);
            } else {
                setInput(<div className='searchSmall'></div>);
            }
        };

        updateInput();

        window.addEventListener('resize', updateInput);

    }, []);

    const handleMeClick = () => {
        if (CookieAuth.getToken() !== undefined) {
            navigate('/me');
        } else {
            navigate('/login');
        }
    };

    return (
        <>
            <header>
                <ul>
                    <li className='logo'><img src="../../../public/images/GC.png" alt="Logo" height="60px" /></li>
                    <li>
                        <Link className='navLinks' to="/main"><img src="../../../public/images/home.svg" alt="Home" height="60px" /></Link>
                        
                    </li>
                    {input}
                    <li onClick={handleMeClick}><img src="../../../public/images/user.svg" alt="Me" height="60px" /></li>
                    <li>
                       <Link className='navLinks' to="/settings"><img src="../../../public/images/settings.svg" alt="Settings" height="60px" /></Link>
                    </li>
                </ul>
            </header>
            <p className='back'></p>
        </>
    );
}