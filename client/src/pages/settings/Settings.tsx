import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import ColorScheme from "../../components/settings/ColorScheme"
import CompanySettings from "../../components/settings/CompanySettings"
import UserSettings from "../../components/settings/UserSettings"
import { } from '../../utils/queries';
import { } from '../../utils/mutations';
import '../../../public/css/style.css';

export default function Settings(): JSX.Element {
    const [navStatus, setNavStatus] = useState<string>("1")

    function returnElement(){
        switch (navStatus) {
            case '1':
              return <UserSettings />;
            case '2':
              return <CompanySettings />;
            case '3':
              return <ColorScheme />;
        }
    }
    

    return (
    <main>
        <div className='bg'>
        <h1>Settings</h1>

        <div>
            <ul>
                <li onClick={()=>setNavStatus("1")}>User Settings</li>
                <li onClick={()=>setNavStatus("2")}>Company Settings</li>
                <li onClick={()=>setNavStatus("3")}>Color Scheme</li>
            </ul>
        </div>
        <div>
            {returnElement()}
        </div>
    </div>
    </main>
    )
}