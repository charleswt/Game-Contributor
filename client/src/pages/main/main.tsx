import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_POSTS } from '../../utils/queries';
import { CREATE_COMMENT } from '../../utils/mutations';
import CookieAuth from '../../utils/auth';
import {jwtDecode} from 'jwt-decode';
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
  const [createComment] = useMutation(CREATE_COMMENT);
  const [commentContent, setCommentContent] = useState<string>();

  useEffect(() => {
    if (data) {
      setPosts(data.posts);
    }
  }, [data]);

  const formatDate = (timestamp: string) => {
    const date = new Date(JSON.parse(timestamp));
    return date.toLocaleDateString('en-US') + ' ' + date.toLocaleTimeString('en-US');
  };


  const handleCreateComment = async (postId: string) => {
    try {
      const tokenUserId: any = await jwtDecode(CookieAuth.getToken())
      const userId = tokenUserId.id
      
      const { data } = await createComment({
        variables: { userId, postId, content: commentContent }
      });
      if (data) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, data.createComment]
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  return (
    <main>
      {loading ? (
        <div className="loader"></div>
      ) : (
        posts.length > 0 ? (
          posts.map((post: Post) => (
            <div className='posts bg' key={post.id}>
              <div className='postProfile' key={post.user.id}>
                <p><img src={post.user.profileImage} alt="Profile" /></p>
                <p>{post.user.firstName} {post.user.lastName}</p>
                <a onClick={() => window.location.href = `/User/${post.user.id}`}>
                  @{post.user.username}
                </a>
              </div>
              <div className='postContent'>
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
                  ""
                )}
                <div>
                  <textarea
                    name="text"
                    rows={4}
                    cols={50}
                    wrap="soft"
                    maxLength={3000}
                    style={{ overflow: 'hidden', resize: 'none' }}
                    placeholder="Content Here..."
                    onChange={(e) => setCommentContent(e.target.value)}
                  />
                  <button onClick={() => handleCreateComment(post.id)}>Post</button>
                </div>
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