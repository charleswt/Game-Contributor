import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MePosts from '../../components/meComponents/posts';
import MeComments from '../../components/meComponents/comments';
import MeCode from '../../components/meComponents/code';
import MeFriends from '../../components/meComponents/friends';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ME, GET_CLOUDINARY } from '../../utils/queries';
import { CREATE_POST, UPDATE_USER_PFP, UPDATE_BIO } from '../../utils/mutations';
import CookieAuth from '../../utils/auth';
import { useDropzone } from 'react-dropzone';
import '../../../public/css/style.css';

interface User {
  id: string;
  bio?: string;
  company?: boolean;
  profileImage: string;
  firstName: string;
  lastName: string;
  username: string;
};

interface Company {
  id?: string;
  companyName: string;
  userId: string;
};

export default function Me(): JSX.Element {
  const navigate = useNavigate()
  const [updateBio] = useMutation(UPDATE_BIO);

  const [bioValue, setBioValue] = useState<boolean>(false);
  const [updateUserPfp] = useMutation(UPDATE_USER_PFP);
  const { loading: cloudinaryLoading, data: cloudinaryData } = useQuery(GET_CLOUDINARY);
  const { loading, data } = useQuery(GET_ME);
  const [me, setMe] = useState<{user: User, company?: Company} | null>(null);
  const [createPost] = useMutation(CREATE_POST);
  const [postContent, setPostContent] = useState<string>('');
  const [showCreatePostPanel, setShowCreatePostPanel] = useState<boolean>(false);
  const [navStatus, setNavStatus] = useState<string>('Friends');
  const [numRows, setNumRows] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
  const [updatePfp, setUpdatePfp] = useState<boolean>(false);
  const [editBio, setEditBio] = useState<string>("");
  const onDrop = useCallback((acceptedFiles: Array<File>) => {
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(acceptedFiles[0]);
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    if (!loading && data) {
      setMe({user: data.me.user, company: data.me.company || null});
    }
  }, [loading, data]);

  const calculateRows = (content: string) => {
    const lines = content.split('\n').length;
    const row = Math.max(lines, Math.ceil(content.length / 35));
    setNumRows(row);
  };

  const handleShowChangePfp = () => setUpdatePfp(!updatePfp);

  const handleCreatePost = async () => {
    try {
      const { data } = await createPost({ variables: { content: postContent } });
      if (data) {
        setPostContent('');
        setShowCreatePostPanel(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setEditBio(newValue);
    calculateRows(newValue);
  };

  const changeBio = async (bio: string) => {
    try {
      const { data } = await updateBio({ variables: { bio } });
      if (data && me) {
        setMe({ user: {...me.user, bio}, company: me.company });
        setEditBio('');
        setBioValue(false);
      }
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  const handleFileSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!file) return;
    const { name, key } = cloudinaryData.cloudinaryCreds;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'test-react-uploads');
    formData.append('api_key', key);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${name}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      await updateUserPfp({ variables: { pfp: result.secure_url } });
      if (me) {
        setMe({ user: {...me.user, profileImage: result.secure_url } });
      }
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
        return <MeCode paramCompanyId={me?.company?.id}/>;
      default:
        return null;
    }
  };

  return (
    <main>
      {me ? (
        <div className='bg myProfile'>
          <div className='user-pfp'>
            <img src={me.user.profileImage || '/images/defaultPfp.png'} alt="profile picture" />
            {!updatePfp && <button onClick={handleShowChangePfp}>Update Photo</button>}
          </div>
          <div className='user-name'>
            <h1>{me.user.firstName} {me.user.lastName}</h1>
              <p>@{me.user.username}</p>
            
            {bioValue ? (
              <div className="comment-reply">
                <textarea
                  name="text"
                  rows={numRows}
                  cols={35}
                  wrap="soft"
                  maxLength={3000}
                  value={editBio}
                  style={{ overflow: 'hidden', resize: 'none' }}
                  placeholder="Content Here..."
                  onChange={handleContentChange}
                />
                <button onClick={() => changeBio(editBio)}>Save</button>
                <button onClick={() => {setBioValue(false); setEditBio("")}}>cancel</button>
              </div>
            ) : (
              <div>
                <div>{me.user.bio}</div>
                <button onClick={() => {setBioValue(true); setEditBio(me.user.bio as string)}}>Update Bio</button>
              </div>
            )}
            
            <div className='img-btn'>
              <img onClick={() => CookieAuth.logout()} src="/images/logout.svg" alt="sign out" />
              <Link to="/settings"><img src="/images/settings.svg" alt="Settings" height="60px" /></Link>
            </div>
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
          <div className="comment-reply">
            <textarea
              name="text"
              rows={numRows}
              cols={30}
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