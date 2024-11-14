import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { searchPosts, searchBooks } from '../api/api';

const SearchResultContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ResultList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 700px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ResultItem = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  height: 400px;
  display: flex;
  flex-direction: column;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const BookInfo = styled.div`
  padding: 15px;
  text-align: center;
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > div {
    margin-top: 10px;
    font-size: 0.9em;
    line-height: 1.4;
    width: 100%;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const BookCover = styled.img`
  width: auto;
  height: 120px;
  object-fit: contain;
`;

const ItemContent = styled.div`
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-top: 1px solid #eee;
`;

const ItemTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  line-height: 1.4;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemType = styled.span`
  font-size: 0.9em;
  color: #666;
  margin-bottom: 10px;
`;

interface BookType {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string;
}

const SearchResult: React.FC = () => {
  const [searchResults, setSearchResults] = useState<Array<any>>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const searchTerm = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [posts, books] = await Promise.all([
          searchPosts(searchTerm),
          searchBooks(searchTerm),
        ]);

        setSearchResults([
          ...posts.map((post) => ({ ...post, type: 'post' })),
          ...books.map((book: BookType) => ({ ...book, type: 'book' })),
        ]);
      } catch (error) {
        console.error('검색 중 오류 발생:', error);
      }
    };

    if (searchTerm) {
      fetchResults();
    }
  }, [searchTerm]);

  const handleResultClick = (item: any) => {
    if (item.type === 'post') {
      navigate(`/post/${item.id}`);
    } else if (item.type === 'book') {
      window.open(`https://books.google.co.kr/books?id=${item.id}`, '_blank');
    }
  };

  return (
    <SearchResultContainer>
      <h2>'{searchTerm}' 검색 결과</h2>
      <ResultList>
        {searchResults.map((item, index) => (
          <ResultItem key={index} onClick={() => handleResultClick(item)}>
            {item.type === 'book' ? (
              <>
                <BookInfo>
                  {item.thumbnail && (
                    <BookCover src={item.thumbnail} alt={item.title} />
                  )}
                  <div>{item.title}</div>
                </BookInfo>
                <ItemContent>
                  <ItemType>도서</ItemType>
                  <div>저자: {item.authors?.join(', ') || '정보 없음'}</div>
                </ItemContent>
              </>
            ) : (
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemType>{item.category}</ItemType>
                <div>작성자: {item.authorName}</div>
              </ItemContent>
            )}
          </ResultItem>
        ))}
      </ResultList>
    </SearchResultContainer>
  );
};

export default SearchResult;
