import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { searchPosts, searchBooks } from '../api/api';

const SearchResultContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const ResultItem = styled.div`
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const ResultTitle = styled.h3`
  margin: 0 0 10px 0;
`;

const ResultType = styled.span`
  font-size: 0.8em;
  color: #666;
`;

const ResultImage = styled.img`
  width: 100px;
  height: auto;
  margin-right: 15px;
`;

const ResultContent = styled.div`
  display: flex;
  align-items: center;
`;

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
          ...books.map((book) => ({ ...book, type: 'book' })),
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
      // 도서 상세 페이지로 이동하거나 모달을 열어 상세 정보를 표시할 수 있습니다.
      console.log('Selected book:', item);
    }
  };

  return (
    <SearchResultContainer>
      <h2>'{searchTerm}' 검색 결과</h2>
      {searchResults.map((item, index) => (
        <ResultItem key={index} onClick={() => handleResultClick(item)}>
          <ResultContent>
            {item.type === 'book' && item.volumeInfo.imageLinks && (
              <ResultImage 
                src={item.volumeInfo.imageLinks.thumbnail || item.volumeInfo.imageLinks.smallThumbnail} 
                alt={item.volumeInfo.title}
              />
            )}
            <div>
              <ResultTitle>
                {item.type === 'post' ? item.title : item.volumeInfo.title}
              </ResultTitle>
              <ResultType>
                {item.type === 'post' ? item.category : '도서'}
              </ResultType>
              {item.type === 'book' && (
                <div>저자: {item.volumeInfo.authors?.join(', ') || '정보 없음'}</div>
              )}
            </div>
          </ResultContent>
        </ResultItem>
      ))}
    </SearchResultContainer>
  );
};

export default SearchResult;
