import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME_POSTS } from '../../utils/queries';
import { UPDATE_POST, DELETE_POST } from '../../utils/mutations';
import { formatDate } from '../../utils/utils';
import '../../../public/css/style.css';

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export default function MePosts() {
  const [updatePost] = useMutation(UPDATE_POST);
  const [deletePost] = useMutation(DELETE_POST);
  const { loading: loadingPosts, data: postData } = useQuery(GET_ME_POSTS);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [numRows, setNumRows] = useState<number>(1);

  useEffect(() => {
    if (!loadingPosts && postData) {
      setUserPosts(postData.mePosts);
    }
  }, [loadingPosts, postData]);

  async function changePost(id: string, content: string) {
    content = `${content}\n[Edited] ${new Date().toISOString()}`;
    try {
      const { data } = await updatePost({
        variables: { id, content }
      });
      if (data) {
        setUserPosts(userPosts.map(post => 
          post.id === id ? { ...post, content: data.updatePost.content } : post
        ));
        setEditingPostId(null);
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  }

  async function destroyPost(id: any) {
    try {
      await deletePost({ variables: { id } });
      setUserPosts(userPosts.filter(post => post.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }

  function calculateRows(content: string) {
    const lines = content.split('\n').length;
    const row = Math.max(lines, Math.ceil(content.length / 35));
    setNumRows(row);
  }

  function handleEdit(post: Post) {
    setEditingPostId(post.id);
    setEditContent(post.content);
    calculateRows(post.content);
  }

  function handleContentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = event.target.value;
    setEditContent(newValue);
    calculateRows(newValue);
  }

  if (loadingPosts) {
    return <div className="loader"></div>;
  }

  return (
    <div>
      {userPosts.length >= 1 && <p className='bg'>Your Posts</p>}
      {userPosts.length > 0 ? (
        userPosts.map((post: Post) => (
          <div className='bg' key={post.id}>
            {/* <div>User ID: {post.userId}</div> */}
            {editingPostId === post.id ? (
              <textarea
                name="text"
                rows={numRows}
                cols={35}
                wrap="soft"
                maxLength={3000}
                value={editContent}
                style={{ overflow: 'hidden', resize: 'none'}}
                placeholder="Content Here..."
                onChange={handleContentChange}
              />
            ) : (
              <div>{post.content}</div>
            )}
            <div>{formatDate(post.createdAt)}</div>
            {editingPostId === post.id ? 
              (<button onClick={() => changePost(post.id, editContent)}>Save</button>) : 
              (<button onClick={() => handleEdit(post)}>Edit</button>)}
            <button onClick={() => destroyPost(post.id)}>Delete</button>
          </div>
        ))
      ) : (
        <p className='bg'>No Posts</p>
      )}
    </div>
  );
}