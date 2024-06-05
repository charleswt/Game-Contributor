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

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  comments: Comment[];
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
          posts.map((post: Post) => (
            <div className='posts' key={post.id}>
              <div className='postProfile' key={post.user.id}>
                <p><img src={post.user.profileImage} alt="Profile" /></p>
                <p>{post.user.firstName} {post.user.lastName}</p>
                <a onClick={() => window.location.href = `/User/${post.user.id}`}>
                  @{post.user.username}
                </a>
              </div>
              <div className='postContent' key={post.id}>
                <p>Content: {post.content}</p>
                <p>Created At: {formatDate(post.createdAt)}</p>
              </div>
              <div className='postComments'>
                {post.comments.length > 0 ? (
                  post.comments.map((comment: Comment) => (
                    <div className='comment' key={comment.id}>
                      <p>{comment.user.firstName} {comment.user.lastName}</p>
                      <p>@{comment.user.username}</p>
                      <p>{comment.content}</p>
                      <p>Created At: {formatDate(comment.createdAt)}</p>
                    </div>
                  ))
                ) : (
                  <p>No Comments</p>
                )}
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