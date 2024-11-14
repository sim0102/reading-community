import React, { useState } from 'react';
import styled from '@emotion/styled';
import { searchBooks } from '../api/api';

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 600px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
`;

const BookList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const BookItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const BookImage = styled.img`
  width: 50px;
  height: 70px;
  object-fit: cover;
  margin-right: 10px;
`;

interface Book {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
}

interface BookSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBook: (book: Book) => void;
}

const BookSearchModal: React.FC<BookSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectBook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const handleSearch = async () => {
    if (searchTerm.trim() === '') return;
    const results = await searchBooks(searchTerm);
    // Google Books API 응답을 우리의 Book 인터페이스 형식으로 변환
    const formattedResults = results.map((book: any) => ({
      id: book.id,
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors,
      thumbnail: book.volumeInfo.imageLinks?.thumbnail,
    }));
    setSearchResults(formattedResults);
  };

  const handleSelectBook = (book: Book) => {
    onSelectBook(book);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalBackground onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <SearchInput
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder='책 제목을 입력하세요'
        />
        <button onClick={handleSearch}>검색</button>
        <BookList>
          {searchResults.map((book) => (
            <BookItem key={book.id} onClick={() => handleSelectBook(book)}>
              {book.thumbnail && (
                <BookImage src={book.thumbnail} alt={book.title} />
              )}
              <div>
                <div>{book.title}</div>
                <div>{book.authors?.join(', ')}</div>
              </div>
            </BookItem>
          ))}
        </BookList>
      </ModalContent>
    </ModalBackground>
  );
};
export default BookSearchModal;
