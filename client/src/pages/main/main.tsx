import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../../utils/queries';
import '../../../public/css/style.css';

interface User {
  id: string;
  profileImage: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

export default function Main() {
  const { loading, data } = useQuery(GET_POSTS);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (data) {
      setPosts(data.posts);
    }
  }, [data]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US');
  };

  return (
    <main>
      <div>Hello</div>
      {loading ? (
        <div className="loader"></div>
      ) : (
        posts.length > 0 ? (
          posts.map((post: Post) => (
            <div key={post.id}>
              <p>ID: {post.id}</p>
              <p>Content: {post.content}</p>
              <p>Created At: {formatDate(post.createdAt)}</p>
              <div>
                <p>User Details:</p>
                <p>ID: {post.user.id}</p>
                <p>Profile Image: <img src={post.user.profileImage} alt="Profile" /></p>
                <p>Name: {post.user.firstName} {post.user.lastName}</p>
                <p>Username: {post.user.username}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No Data</p>
        )
      )}
    </main>
  );
}