import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ME_COMMENTS } from '../../utils/queries';
import {formatDate} from '../../utils/utils'
import '../../../public/css/style.css';

interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: string;
  }

export default function MeComments(){
    const { loading: commentLoading, data: commentData } = useQuery(GET_ME_COMMENTS);
    const [comments, setComments] = useState<Comment[]>([]);

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
        <p className='bg'>Your Comments</p>
        {comments? (
          comments.map((comment: Comment) => (
            <div className='bg' key={comment.id}>
              <div>Post ID: {comment.postId}</div>
              <div>User ID: {comment.userId}</div>
              <div>{comment.content}</div>
              <div>{formatDate(comment.createdAt)}</div>
            </div>
          ))
        ) : (
          <p>No Comments</p>
        )}
      </div>
    )
}