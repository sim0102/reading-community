import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import {
  createComment,
  getComments,
  deleteComment,
  deletePost,
  getPost,
} from '../firebase';
import { Timestamp } from 'firebase/firestore';
import { Viewer } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import { UserInfo } from 'firebase/auth';

const PostDetailContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const CommentForm = styled.form`
  margin-top: 20px;
`;

const CommentInput = styled.textarea`
  width: 95%;
  padding: 10px;
  margin-bottom: 10px;
  resize: none;
`;

const CommentList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const CommentItem = styled.li`
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 10px;
  padding: 10px;
`;

const AuthorName = styled.span`
  font-size: 0.8em;
  color: #666;
  float: right;
`;

const CommentAuthor = styled(AuthorName)`
  margin-left: 10px;
`;

const BookInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const BookCover = styled.img`
  width: 100px;
  height: auto;
  margin-right: 20px;
`;

const BookDetails = styled.div`
  flex: 1;
`;

interface BookType {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string;
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: Timestamp;
  authorName: string;
}
interface PostDetailProps {
  user: UserInfo | null;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: Timestamp;
  userId: string;
  book?: {
    id: string;
    title: string;
    authors: string[];
    thumbnail: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: Timestamp;
  userId: string;
  book?: BookType;
}

const PostDetail: React.FC<PostDetailProps> = ({ user }) => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!postId) return;
      setLoading(true);
      try {
        const fetchedPost = await getPost(postId);
        setPost(fetchedPost as Post);
        const fetchedComments = await getComments(postId);
        setComments(fetchedComments as Comment[]);
      } catch (err) {
        console.error('데이터 가져오기 실패:', err);
        setError('게시물을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [postId]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>게시물을 찾을 수 없습니다.</div>;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postId) return;
    try {
      await createComment(postId, user.uid, newComment);
      const updatedComments = await getComments(postId);
      setComments(updatedComments as Comment[]);
      setNewComment('');
    } catch (error) {
      console.error('댓글 작성 중 오류 발생:', error);
    }
  };

  const handlePostDelete = async () => {
    if (!user || !postId) return;
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmDelete) return;
    try {
      await deletePost(postId);
      navigate('/');
    } catch (error) {
      console.error('게시물 삭제 중 오류 발생:', error);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!user || !postId) return;
    try {
      await deleteComment(commentId);
      const updatedComments = await getComments(postId);
      setComments(updatedComments as Comment[]);
    } catch (error) {
      console.error('댓글 삭제 중 오류 발생:', error);
    }
  };

  return (
    <PostDetailContainer>
      <h1>{post.title}</h1>
      <AuthorName>{post.authorName}</AuthorName>
      {post.book && (
        <BookInfo>
          <BookCover src={post.book.thumbnail} alt={post.book.title} />
          <BookDetails>
            <h3>{post.book.title}</h3>
            <p>저자: {post.book.authors?.join(', ')}</p>
          </BookDetails>
        </BookInfo>
      )}
      <Viewer initialValue={post.content} />
      {user && user.uid === post.userId && (
        <div>
          <button onClick={() => navigate(`/edit/${post.id}`)}>
            게시물 수정
          </button>
          <button onClick={handlePostDelete}>게시물 삭제</button>
        </div>
      )}
      <h2>댓글</h2>
      {user && (
        <CommentForm onSubmit={handleCommentSubmit}>
          <CommentInput
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder='댓글을 입력하세요'
            required
          />
          <button type='submit'>댓글 작성</button>
        </CommentForm>
      )}
      <CommentList>
        {comments.map((comment) => (
          <CommentItem key={comment.id}>
            <p>
              {comment.content}
              <CommentAuthor>{comment.authorName}</CommentAuthor>
            </p>
            {user && user.uid === comment.userId && (
              <button onClick={() => handleCommentDelete(comment.id)}>
                삭제
              </button>
            )}
          </CommentItem>
        ))}
      </CommentList>
    </PostDetailContainer>
  );
};

export default PostDetail;
