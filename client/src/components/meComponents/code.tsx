import '../../../public/css/style.css';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation  } from '@apollo/client';
import { GET_PUBLISHED_CODES } from '../../utils/queries'

interface Code {
    id: string;
    userId: string;
    code: string;
    createdAt: string;
    firstName: string;
    lastName: string;
    username: string;
}
export default function MeCode(){
    const {loading: codeLoading, data: codeData } = useQuery(GET_PUBLISHED_CODES);
    const [pubdCodes, setPubdCodes] = useState<Code[]>([])

    useEffect(()=>{
        setPubdCodes(codeData)
    },[codeData, codeLoading])

    return (<>
        {pubdCodes? 
        (pubdCodes.map((code: Code)=>(
            <div className='bg' key={code.id}>
            <div>{code.id}</div>
            <div>{code.createdAt}</div>
            <div>{code.userId}</div>
            <div>{code.firstName}</div>
            <div>{code.lastName}</div>
            <div>{code.username}</div>
        </div>
    ))): 
    (<div className='bg'>You Have No Published Code</div>)}
    </>)
}