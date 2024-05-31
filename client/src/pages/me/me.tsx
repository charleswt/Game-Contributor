import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client';
import { GET_ME } from '../../utils/queries'
import '../../../public/css/style.css'

export default function Me(): any{
    const { loading, data } = useQuery(GET_ME);
    const [me, setMe] = useState()

    useEffect(()=>{
        if(!data){
           setMe(data) 
        }
    },[loading, data])
    return (
        <main>
            <div>hello</div>
            {me ? <p>{me}</p>:<p>No Data</p>}
        </main>
    )
}