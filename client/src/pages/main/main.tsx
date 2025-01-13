import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_POSTS } from '../../utils/queries';
import { CREATE_COMMENT } from '../../utils/mutations';
import CookieAuth from '../../utils/auth';
import { formatDate } from '../../utils/utils';
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
  const [commentsToShow, setCommentsToShow] = useState<{ [key: string]: number }>({});
  const [numRows, setNumRows] = useState<number>(1);
  // const [imgArr, setImgArr] = useState<string[]>([""])
  const navigate = useNavigate();

  function calculateRows(content: string) {
    const lines = content.split('\n').length;
    const row = Math.max(lines, Math.ceil(content.length / 35));
    setNumRows(row);
  }


  useEffect(() => {
    if (data?.posts) {
      setPosts(data.posts);
      const initialCommentsToShow = data.posts.reduce((acc: { [key: string]: number }, post: Post) => {
        acc[post.id] = 1;
        return acc;
      }, {});
      setCommentsToShow(initialCommentsToShow);
    }
  }, [data]);

  // useEffect(()=>{
  //   if(!loading && posts){
  //     const mapping: string[] = posts.map((post: Post) => post.user.profileImage || '/images/defaultPfp.png')
  //     setImgArr(mapping)
  //     if(imgArr.length >= 2){
  //       console.log(imgArr)
  //     }
      
  //     console.log(mapping)
  //   }
  // },[loading, posts])

  const handleCreateComment = async (postId: string) => {
    try {
      const userId: string = JSON.stringify(CookieAuth.getTokenId());

      const { data } = await createComment({
        variables: { postId, userId, content: commentContent }
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

  const handleViewMoreComments = (postId: string) => {
    setCommentsToShow({
      ...commentsToShow,
      [postId]: commentsToShow[postId] + 10
    });
  };

  return (
    <main>
      {loading ? (
        <div className="loader"></div>
      ) : (
          posts.map((post: Post, index: number) => (
            <div className='posts bg' key={index}>
              <div className='postProfile' key={post.user.id}>
                <p><img src={post.user.profileImage || '/images/defaultPfp.png'} alt="Profile" /></p>
                <p>{post.user.firstName} {post.user.lastName}</p>
                <a onClick={() => {
                      if(CookieAuth.getTokenId() === JSON.parse(post.user.id)){
                        navigate("/me")
                      } else if (CookieAuth.getTokenId() && CookieAuth.getTokenId() !== JSON.parse(post.user.id)){
                        navigate(`/user/${post.user.id}`)
                      }
                  }} >
                  @{post.user.username}
                </a>
              </div>
              <div className='postContent'>
                <p>Content: {post.content}</p>
                <p>Created At: {formatDate(post.createdAt)}</p>
              </div>
              <div className='postComments'>
                {post.comments.length > 0? (post.comments.slice(0, commentsToShow[post.id]).map((comment: Comment) => (
                  <div className='comment' key={comment.id}>
                    <div>
                      <img src={comment.user.profileImage || '/images/defaultPfp.png'}/>
                    <p>{comment.user.firstName} {comment.user.lastName}</p>
                    <a onClick={() => {
                      if(CookieAuth.getTokenId() === JSON.parse(comment.user.id)){
                        navigate("/me")
                      } else if (CookieAuth.getTokenId() && CookieAuth.getTokenId() !== JSON.parse(comment.user.id)){
                        navigate(`/user/${comment.user.id}`)
                      }
                      }}>
                      @{comment.user.username}</a>
                    </div>
                    
                    <p>{comment.content}</p>
                    <p>Created at: {formatDate(comment.createdAt)}</p>
                  </div>
                ))):(<div>Be the first to comment!</div>)}
                {post.comments.length > commentsToShow[post.id] && (
                  <button className='more-comments' onClick={() => handleViewMoreComments(post.id)}>View More Comments</button>
                )}
                <div className="comment-reply">
                  <textarea
                    name="text"
                    rows={numRows}
                    cols={35}
                    wrap="soft"
                    maxLength={3000}
                    style={{ overflow: 'hidden', resize: 'none' }}
                    placeholder="Content Here..."
                    onChange={(e) => {setCommentContent(e.target.value); calculateRows(e.target.value)}}
                  />
                  <button onClick={() => handleCreateComment(post.id)}>Reply</button>
                </div>
              </div>
            </div>
          ))
      )}
    </main>
  );
}