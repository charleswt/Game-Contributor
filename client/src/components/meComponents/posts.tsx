import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ME_POSTS } from '../../utils/queries';
import { formatDate } from '../../utils/utils';
import '../../../public/css/style.css';

interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export default function MePosts() {
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

  function calculateRows(content: string) {
    const length = content.length;
    const row = Math.ceil(length / 35);
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
      <p className='bg'>Your Posts</p>
      {userPosts.length > 0 ? (
        userPosts.map((post: Post) => (
          <div className='bg' key={post.id}>
            <div>User ID: {post.userId}</div>
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
            <button onClick={() => handleEdit(post)}>
              {editingPostId === post.id ? 'Save' : 'Edit'}
            </button>
            <button>Delete</button>
          </div>
        ))
      ) : (
        <p>No Posts</p>
      )}
    </div>
  );
}