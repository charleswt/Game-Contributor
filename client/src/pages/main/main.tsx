import React, { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../../utils/queries'
import '../../../public/css/style.css'

export default function Main(): any{
    const { loading, data } = useQuery(GET_POSTS);
    const [posts, setPosts] = useState()

    useEffect(()=>{
        if(!data){
           setPosts(data) 
        }
        
    },[loading, data])
    return (
        <main>
            <div>hello</div>
            {posts ? <p>{posts}</p>:<p>No Data</p>}
        </main>
    )
}