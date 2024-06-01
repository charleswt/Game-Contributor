import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../../utils/queries';
import '../../../public/css/style.css';

interface Posts {
    id: string,
    userId: string;
    content: string;
    createdAt: string;
}

export default function Main() {
    const { loading, data } = useQuery(GET_POSTS);
    const [posts, setPosts] = useState([]);
  
    useEffect(() => {
      if (data) {
        setPosts(data.posts);
      }
    }, [data]);
  
    const formatDate = (timestamp: string) => {
      const date = new Date(JSON.parse(timestamp));
      return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US');
    };
  
    return (
      <main>
        <div>Hello</div>
        {loading ? (
          <div className="loader"></div>
        ) : (
          posts.length > 0 ? (
            posts.map((post: Posts) => (
              <div key={post.id}>
                <p>ID: {post.id}</p>
                <p>User ID: {post.userId}</p>
                <p>Content: {post.content}</p>
                <p>Created At: {formatDate(post.createdAt)}</p>
              </div>
            ))
          ) : (
            <p>No Data</p>
          )
        )}
      </main>
    );
  }