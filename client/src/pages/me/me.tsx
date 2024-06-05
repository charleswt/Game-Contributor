import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ME, GET_COMMENTS } from '../../utils/queries';
import { CREATE_POST } from '../../utils/mutations';
import '../../../public/css/style.css';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
}

interface Post {
  content: string;
}

export default function Me(): any {
  const { loading, data } = useQuery(GET_ME);
  const [me, setMe] = useState<User | null>(null);

  const { loading: commentLoading, data: commentData } = useQuery(GET_COMMENTS);
  const [comments, setComments] = useState<Comment[]>([]);

  const [createPost] = useMutation(CREATE_POST);
  const [postContent, setPostContent] = useState<string>('');
  const [showCreatePostPanel, setShowCreatePostPanel] = useState<boolean>(false);

  useEffect(() => {
    if (!loading && data) {
      setMe(data.me.user);
    }
    if (!commentLoading && commentData) {
      setComments(commentData.comments);
    }
  }, [loading, data, commentLoading, commentData]);

  if (loading || commentLoading) {
    return <div className="loader"></div>;
  }

  const handleCreatePost = async () => {
    try {
      const { data } = await createPost({
        variables: { content: postContent }
      });
      if (data) {
        setPostContent('');
        setShowCreatePostPanel(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const createPostPanel = () => (
    <div>
      <textarea
        name="text"
        rows={14}
        cols={10}
        wrap="soft"
        maxLength={3000}
        style={{ overflow: 'hidden', resize: 'none' }}
        placeholder="Content Here..."
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
      />
      <button onClick={handleCreatePost}>Post</button>
    </div>
  );

  return (
    <main>
      <div>hello</div>
      {me ? (
        <div>
          <p>{me.firstName} {me.lastName}</p>
          <p>Username: {me.username}</p>
          <p>Email: {me.email}</p>
        </div>
      ) : (
        <p>No Data</p>
      )}

      <div className="createPost bg">
        <button onClick={() => setShowCreatePostPanel(!showCreatePostPanel)}>
          Create Post
        </button>
        {showCreatePostPanel && createPostPanel()}
      </div>

      <div>
        <p>Your Comments</p>
        {comments.length > 0 ? (
          comments.map((comment: Comment) => (
            <div key={comment.id}>
              <div>Post ID: {comment.postId}</div>
              <div>User ID: {comment.userId}</div>
              <div>Content: {comment.content}</div>
            </div>
          ))
        ) : (
          <p>No Comments</p>
        )}
      </div>
    </main>
  );
}