import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Editor } from '@toast-ui/react-editor';
import { createPost, getPost, updatePost } from '../firebase';
import BookSearchModal from '../components/BookSearchModal';
import { UserInfo } from 'firebase/auth';

const WriteContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin-bottom: 10px;
  padding: 10px;
  font-size: 16px;
`;

const Select = styled.select`
  margin-bottom: 10px;
  padding: 10px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const BookInfo = styled.div`
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const BookCover = styled.img`
  width: 100px;
  height: auto;
`;

const BookDetails = styled.div`
  flex: 1;
`;

interface Book {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
}

interface WriteProps {
  user: UserInfo | null;
  isEdit?: boolean;
}

const Write: React.FC<WriteProps> = ({ user, isEdit = false }) => {
  const { postId } = useParams<{ postId?: string }>();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('자유 게시판');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const editorRef = useRef<Editor>(null);
  const navigate = useNavigate();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (isEdit && postId) {
      const fetchPost = async () => {
        try {
          const post = await getPost(postId);
          if (post.userId !== user.uid) {
            alert('수정 권한이 없습니다.');
            navigate('/');
            return;
          }
          setTitle(post.title);
          setCategory(post.category);
          if (editorRef.current) {
            editorRef.current.getInstance().setMarkdown(post.content);
          }
          if (post.book) {
            setSelectedBook({
              id: post.book.id,
              title: post.book.title,
              authors: post.book.authors,
              thumbnail: post.book.thumbnail,
            });
          }
        } catch (error) {
          console.error('게시물 가져오기 실패:', error);
          navigate('/');
        }
      };
      fetchPost();
    }
  }, [user, navigate, isEdit, postId]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.uid) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    const content = editorRef.current?.getInstance().getMarkdown();
    if (!content) {
      alert('내용을 입력해주세요.');
      return;
    }
    try {
      if (isEdit && postId) {
        await updatePost(postId, title, content, category, selectedBook);
        alert('글이 성공적으로 수정되었습니다.');
        navigate(`/post/${postId}`);
      } else {
        const newPostId = await createPost(
          user.uid,
          title,
          content,
          category,
          selectedBook
        );
        alert('글이 성공적으로 작성되었습니다.');
        navigate(`/post/${newPostId}`);
      }
    } catch (error) {
      console.error(
        isEdit ? '글 수정 중 오류 발생:' : '글 작성 중 오류 발생:',
        error
      );
      alert(isEdit ? '글 수정에 실패했습니다.' : '글 작성에 실패했습니다.');
    }
  };

  return (
    <WriteContainer>
      <h1>{isEdit ? '글 수정' : '글쓰기'}</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          type='text'
          placeholder='제목'
          value={title}
          onChange={handleTitleChange}
          required
        />
        <Select value={category} onChange={handleCategoryChange}>
          <option value='독후감'>독후감</option>
          <option value='독서 모임'>독서 모임</option>
          <option value='자유 게시판'>자유 게시판</option>
        </Select>
        <button type='button' onClick={() => setIsModalOpen(true)}>
          책 검색
        </button>
        {selectedBook && (
          <BookInfo>
            {selectedBook.thumbnail && (
              <BookCover
                src={selectedBook.thumbnail}
                alt={selectedBook.title}
              />
            )}
            <BookDetails>
              <h3>{selectedBook.title}</h3>
              <p>{selectedBook.authors?.join(', ')}</p>
            </BookDetails>
          </BookInfo>
        )}
        <Editor
          ref={editorRef}
          initialValue=''
          previewStyle='vertical'
          height='400px'
          initialEditType='markdown'
          useCommandShortcut={true}
        />
        <Button type='submit'>{isEdit ? '수정하기' : '글쓰기'}</Button>
      </Form>
      <BookSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectBook={handleBookSelect}
      />
    </WriteContainer>
  );
};

export default Write;
