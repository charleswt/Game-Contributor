import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { } from '../../utils/queries';
import { } from '../../utils/mutations';
import '../../../public/css/style.css';

export default function Settings(): JSX.Element {

    return (
    <main>
        <div className='bg'>
        <h1>Settings</h1>

        <div>
            <ul>
                <li>Change Name/Username</li>
                <li>Become a Company</li>
                <li>Color Scheme</li>
            </ul>
        </div>
        <div></div>
    </div>
    </main>
    )
}