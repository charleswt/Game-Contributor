import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ME, GET_ME_COMMENTS, GET_ME_POSTS } from '../../utils/queries';
import { CREATE_POST } from '../../utils/mutations';
import '../../../public/css/style.css';

interface User {
  id: string;
  profilePicture?: string;
  firstName: string;
  lastName: string;
  username: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export default function Me(): any {
  const { loading, data } = useQuery(GET_ME);
  const [me, setMe] = useState<User | null>(null);

  const { loading: commentLoading, data: commentData } = useQuery(GET_ME_COMMENTS);
  const [comments, setComments] = useState<Comment[]>([]);

  const [createPost] = useMutation(CREATE_POST);
  const [postContent, setPostContent] = useState<string>('');
  const [showCreatePostPanel, setShowCreatePostPanel] = useState<boolean>(false);

  const { loading: loadingPosts, data: postData } = useQuery(GET_ME_POSTS);
  const [userPosts, setUserPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!loading && data) {
      setMe(data.me.user);
    }
    if (!commentLoading && commentData) {
      setComments(commentData.comments);
    }
    if (!loadingPosts && postData) {
      setUserPosts(postData.mePosts);
    }
  }, [loading, data, commentLoading, commentData, loadingPosts, postData]);

  if (loading || commentLoading || loadingPosts) {
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
      {me ? (
        <div className='bg myProfile'>
          <img src={me.profilePicture} alt="profile picture" />
          <h1>{me.firstName} {me.lastName}</h1>
          <p>@{me.username}</p>
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
        <p className='bg'>Your Comments</p>
        {comments? (
          comments.map((comment: Comment) => (
            <div className='bg' key={comment.id}>
              <div>Post ID: {comment.postId}</div>
              <div>User ID: {comment.userId}</div>
              <div>Content: {comment.content}</div>
              <div>Content: {comment.createdAt}</div>
            </div>
          ))
        ) : (
          <p>No Comments</p>
        )}
      </div>

      <div>
        <p className='bg'>Your Posts</p>
        {userPosts? (
          userPosts.map((post: Post) => (
            <div className='bg' key={post.id}>
              <div>User ID: {post.userId}</div>
              <div>Content: {post.content}</div>
            </div>
          ))
        ) : (
          <p>No Posts</p>
        )}
      </div>
    </main>
  );
}