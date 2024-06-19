import React, { useEffect, useState } from 'react';
import MePosts from '../../components/meComponents/posts';
import MeComments from '../../components/meComponents/comments';
import MeCode from '../../components/meComponents/code';
import MeFriends from '../../components/meComponents/friends';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ME } from '../../utils/queries';
import { CREATE_POST } from '../../utils/mutations';
import CookieAuth from '../../utils/auth'
import '../../../public/css/style.css';

interface User {
  id: string;
  profilePicture?: string;
  firstName: string;
  lastName: string;
  username: string;
}

export default function Me(): any {
  // Profile information
  const { loading, data } = useQuery(GET_ME);
  const [me, setMe] = useState<User | null>(null);

  // create post operations
  const [createPost] = useMutation(CREATE_POST);
  const [postContent, setPostContent] = useState<string>('');
  const [showCreatePostPanel, setShowCreatePostPanel] = useState<boolean>(false);

  // Navigation state
  const [navStatus, setNavStatus] = useState<string>('Friends');

  useEffect(() => {
    if (!loading && data) {
      setMe(data.me.user);
    }
  }, [loading, data]);

  if (loading) {
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

  const renderContent = () => {
    switch (navStatus) {
      case 'Friends':
        return <MeFriends />;
      case 'Posts':
        return <MePosts />;
      case 'Comments':
        return <MeComments />;
      case 'Code':
        return <MeCode />;
      default:
        return null;
    }
  };

  return (
    <main>
      {me ? (
        <div className='bg myProfile'>
          <img src={me.profilePicture} alt="profile picture" />
          <h1>{me.firstName} {me.lastName}</h1>
          <p>@{me.username}</p>
          <button onClick={()=>CookieAuth.logout()}>Logout</button>
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

      <ul className='meNav'>
        <li onClick={() => setNavStatus('Friends')}>Friends</li>
        <li>|</li>
        <li onClick={() => setNavStatus('Posts')}>Posts</li>
        <li>|</li>
        <li onClick={() => setNavStatus('Comments')}>Comments</li>
        <li>|</li>
        <li onClick={() => setNavStatus('Code')}>Code</li>
      </ul>

      {renderContent()}
    </main>
  );
}