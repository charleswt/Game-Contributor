import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME_COMMENTS } from '../../utils/queries';
import { UPDATE_COMMENT, DELETE_COMMENT } from '../../utils/mutations';
import { formatDate } from '../../utils/utils';
import '../../../public/css/style.css';

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export default function MeComments() {
  const { loading: commentLoading, data: commentData } = useQuery(GET_ME_COMMENTS);
  const [comments, setComments] = useState<Comment[]>([]);
  const [updateComment] = useMutation(UPDATE_COMMENT);
  const [deleteComment] = useMutation(DELETE_COMMENT);
  const [editContent, setEditContent] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [numRows, setNumRows] = useState<number>(1);

  function calculateRows(content: string) {
    const lines = content.split('\n').length;
    const row = Math.max(lines, Math.ceil(content.length / 35));
    setNumRows(row);
  }

  function handleContentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = event.target.value;
    setEditContent(newValue);
    calculateRows(newValue);
  }

  function changeComment(id: string, content: string) {
    updateComment({
      variables: { id, content },
    })
      .then(() => {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === id ? { ...comment, content } : comment
          )
        );
        setEditingCommentId(null);
        setEditContent('');
      })
      .catch((error) => {
        console.error('Unable to update comment:', error);
      });
  }

  async function destroyComment(id: string) {
    await deleteComment({
      variables: { id },
    })
      .then(() => {
        setComments((prevComments) => prevComments.filter((comment) => comment.id !== id));
      })
      .catch((error) => {
        console.error('Unable to delete comment:', error);
      });
  }

  function handleEdit(comment: Comment) {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    calculateRows(comment.content);
  }

  useEffect(() => {
    if (!commentLoading && commentData) {
      setComments(commentData.meComments);
    }
  }, [commentLoading, commentData]);

  if (commentLoading) {
    return <div className="loader"></div>;
  }

  return (
    <div>
      {comments.length >= 1 && <p className='bg'>Your Comments</p>}
      {comments.length > 0 ? (
        comments.map((comment: Comment) => (
          <div className='bg' key={comment.id}>
            {/* <div>Post ID: {comment.postId}</div>
            <div>User ID: {comment.userId}</div> */}
            {editingCommentId === comment.id ? (
              <textarea
                name="text"
                rows={numRows}
                cols={35}
                wrap="soft"
                maxLength={3000}
                value={editContent}
                style={{ overflow: 'hidden', resize: 'none' }}
                placeholder="Content Here..."
                onChange={handleContentChange}
              />
            ) : (
              <div>{comment.content}</div>
            )}
            <div>{formatDate(comment.createdAt)}</div>
            {editingCommentId === comment.id ? (
              <button onClick={() => changeComment(comment.id, editContent)}>Save</button>
            ) : (
              <button onClick={() => handleEdit(comment)}>Edit</button>
            )}
            <button onClick={() => destroyComment(comment.id)}>Delete</button>
          </div>
        ))
      ) : (
        <p className='bg'>No comments</p>
      )}
    </div>
  );
}