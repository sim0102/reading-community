import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { Editor } from '@toast-ui/react-editor';
import { createPost } from '../firebase';
import BookSearchModal from '../components/BookSearchModal';

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
`;

interface WriteProps {
  user: { uid: string } | null;
}

const Write: React.FC<WriteProps> = ({ user }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('자유 게시판');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const editorRef = useRef<Editor>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
  };

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
      const postId = await createPost(
        user.uid,
        title,
        content,
        category,
        selectedBook
      );
      alert('글이 성공적으로 작성되었습니다.');
      navigate(`/post/${postId}`);
    } catch (error) {
      console.error('글 작성 중 오류 발생:', error);
      alert('글 작성에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <WriteContainer>
      <h1>글쓰기</h1>
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
            <h3>선택된 책:</h3>
            <p>{selectedBook.volumeInfo.title}</p>
            <p>{selectedBook.volumeInfo.authors?.join(', ')}</p>
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
        <Button type='submit'>글 작성</Button>
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
