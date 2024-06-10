import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ME_POSTS } from '../../utils/queries';
import {formatDate} from '../../utils/utils'
import '../../../public/css/style.css';

interface Post {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
  }

export default function MePosts(){
    const { loading: loadingPosts, data: postData } = useQuery(GET_ME_POSTS);
    const [userPosts, setUserPosts] = useState<Post[]>([]);

    useEffect(() => {
        if (!loadingPosts && postData) {
          setUserPosts(postData.mePosts);
        }
      }, [loadingPosts, postData]);
    
      if (loadingPosts) {
        return <div className="loader"></div>;
      }

    return (
        <div>
        <p className='bg'>Your Posts</p>
        {userPosts? (
          userPosts.map((post: Post) => (
            <div className='bg' key={post.id}>
              <div>User ID: {post.userId}</div>
              <div>{post.content}</div>
              <div>{formatDate(post.createdAt)}</div>
            </div>
          ))
        ) : (
          <p>No Posts</p>
        )}
      </div>

    )
}