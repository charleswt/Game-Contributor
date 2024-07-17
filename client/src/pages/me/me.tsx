import React, { useEffect, useState, useCallback } from 'react';
import MePosts from '../../components/meComponents/posts';
import MeComments from '../../components/meComponents/comments';
import MeCode from '../../components/meComponents/code';
import MeFriends from '../../components/meComponents/friends';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ME, GET_CLOUDINARY } from '../../utils/queries';
import { CREATE_POST, UPDATE_USER_PFP } from '../../utils/mutations';
import CookieAuth from '../../utils/auth';
import { useDropzone } from 'react-dropzone';
import '../../../public/css/style.css';

interface User {
  id: string;
  profileImage?: string;
  firstName: string;
  lastName: string;
  username: string;
}

export default function Me(): any {
  // update user profile image\
  const [updateUserPfp] = useMutation(UPDATE_USER_PFP);
  const {loading: cloudinaryLoading, data: cloudinaryData } = useQuery(GET_CLOUDINARY);
  // Profile information
  const { loading, data } = useQuery(GET_ME);
  const [me, setMe] = useState<User | null>(null);

  // create post operations
  const [createPost] = useMutation(CREATE_POST);
  const [postContent, setPostContent] = useState<string>('');
  const [showCreatePostPanel, setShowCreatePostPanel] = useState<boolean>(false);

  // Navigation state
  const [navStatus, setNavStatus] = useState<string>('Friends');

  const [numRows, setNumRows] = useState<number>(1);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);

  const [updatePfp, setUpdatePfp] = useState(false);

  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    const reader = new FileReader();

    reader.onload = function () {
      setPreview(reader.result);
    };

    reader.readAsDataURL(acceptedFiles[0]);
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    if (!loading && data) {
      setMe(data.me.user)
      
    }
  }, [data]);

  function calculateRows(content: string) {
    const lines = content.split('\n').length;
    const row = Math.max(lines, Math.ceil(content.length / 35));
    setNumRows(row);
  }

  function handleShowChangePfp() {
    setUpdatePfp(!updatePfp);
  }

  const handleCreatePost = async () => {
    try {
      const { data } = await createPost({
        variables: { content: postContent },
      });
      if (data) {
        setPostContent('');
        setShowCreatePostPanel(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleFileSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!file) return;

    const { name, key } = await cloudinaryData.cloudinaryCreds

    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', 'test-react-uploads'); // Ensure this preset exists in your Cloudinary settings
    formData.append('api_key', key);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${name}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      await updateUserPfp({
        variables: { pfp: result.secure_url }
      })

      setMe((prevMe) => prevMe ? { ...prevMe, profilePicture: result.secure_url } : null);

      setUpdatePfp(false);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

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
          <div className='user-pfp'>
          <img src={me.profileImage ? me.profileImage : '../../../public/images/defaultPfp.png'} alt="profile picture" />
          {!updatePfp && <button onClick={handleShowChangePfp}>Update Photo</button>}
          </div>
          <div className='user-name'>
            <div>
              <h1>{me.firstName} {me.lastName}</h1>
              <p>@{me.username}</p>
              <button onClick={() => CookieAuth.logout()}>Logout</button>
            </div>
          <div>Bio</div>
          </div>
        </div>
      ) : (
        <p>No Data</p>
      )}

      {updatePfp && (
        <div className='bg'>
          <div {...getRootProps()}>
            <input {...getInputProps()} accept='image/png, image/jpg, image/jpeg, image/svg, image/webp' />
            {isDragActive ? <p>Drop the files here...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
          </div>
          {preview && <img src={preview as string} alt="Preview" />}
          <button onClick={handleFileSubmit}>Upload</button>
          <button onClick={handleShowChangePfp}>Cancel</button>
        </div>
      )}

      <div className="createPost bg">
        <button onClick={() => setShowCreatePostPanel(!showCreatePostPanel)}>
          Create Post
        </button>

        {showCreatePostPanel && (
          <div>
            <textarea
              name="text"
              rows={numRows}
              cols={10}
              wrap="soft"
              maxLength={3000}
              style={{ overflow: 'hidden', resize: 'none' }}
              placeholder="Content Here..."
              value={postContent}
              onChange={(e) => { setPostContent(e.target.value); calculateRows(e.target.value); }}
            />
            <button onClick={handleCreatePost}>Post</button>
          </div>
        )}
      </div>

      <ul className='meNav'>
        <li onClick={() => setNavStatus('Friends')}>Friends</li>
        <li onClick={() => setNavStatus('Posts')}>Posts</li>
        <li onClick={() => setNavStatus('Comments')}>Comments</li>
        <li onClick={() => setNavStatus('Code')}>Code</li>
      </ul>

      {renderContent()}
    </main>
  );
};