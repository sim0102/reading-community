import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { getPosts } from '../firebase';
import { Link, useParams } from 'react-router-dom';
import { Viewer } from '@toast-ui/react-editor';
import { UserInfo } from 'firebase/auth';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const PostList = styled.div`
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

const PostLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const PostItem = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  height: 400px;
  display: flex;
  flex-direction: column;

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

const PostContent = styled.div`
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-top: 1px solid #eee;
`;

const PostTitle = styled.h3`
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

const PostAuthor = styled.span`
  font-size: 0.9em;
  color: #666;
  margin-bottom: 10px;
`;

const PostExcerpt = styled.div`
  flex: 1;
  overflow: hidden;
  font-size: 0.9em;
  color: #444;

  .toastui-editor-contents {
    font-size: 0.9em;
  }

  p {
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

const PageButton = styled.button<{ disabled?: boolean }>`
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover {
    background-color: ${(props) => (props.disabled ? 'white' : '#f0f0f0')};
  }
`;

interface HomeProps {
  user: UserInfo | null;
}

const Home: React.FC<HomeProps> = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { category } = useParams<{ category?: string }>();
  const [firstDoc, setFirstDoc] = useState<any>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasPrevious, setHasPrevious] = useState(false); // 초기값은 false

  useEffect(() => {
    // 카테고리 변경 시 상태 초기화
    setFirstDoc(null);
    setLastDoc(null);
    setHasMore(true);
    setHasPrevious(false); // 카테고리 변경 시 false로 초기화
    fetchPosts('next', null);
  }, [category]);

  const fetchPosts = async (
    direction: 'next' | 'prev' = 'next',
    cursor: any = null
  ) => {
    setLoading(true);
    try {
      const result = await getPosts(category, 12, cursor, direction);

      if (result.posts.length > 0) {
        setPosts(result.posts);
        setFirstDoc(result.firstDoc);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
        setHasPrevious(!result.isFirstPage);
      } else {
        // 결과가 없으면 초기 상태로 되돌림
        setPosts([]);
        setFirstDoc(null);
        setLastDoc(null);
        setHasMore(false);
        setHasPrevious(false);
      }

      window.scrollTo(0, 0);
    } catch (error) {
      console.error('게시물 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      fetchPosts('next', lastDoc);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevious) {
      fetchPosts('prev', firstDoc);
    }
  };

  return (
    <HomeContainer>
      <h1>{category ? `${category} 게시판` : '전체 게시판'}</h1>
      {loading ? (
        <LoadingContainer>데이터를 불러오는 중입니다...</LoadingContainer>
      ) : (
        <>
          <PostList>
            {posts.map((post) => (
              <PostLink to={`/post/${post.id}`} key={post.id}>
                <PostItem>
                  {post.book ? (
                    <BookInfo>
                      {post.book.thumbnail && (
                        <BookCover
                          src={post.book.thumbnail}
                          alt={post.book.title}
                        />
                      )}
                      <div>{post.book.title}</div>
                    </BookInfo>
                  ) : (
                    <BookInfo>
                      <div>책 정보 없음</div>
                    </BookInfo>
                  )}
                  <PostContent>
                    <PostTitle>{post.title}</PostTitle>
                    <PostAuthor>{post.authorName}</PostAuthor>
                    <PostExcerpt>
                      <Viewer initialValue={post.content} />
                    </PostExcerpt>
                  </PostContent>
                </PostItem>
              </PostLink>
            ))}
          </PostList>
          <PaginationContainer>
            <PageButton onClick={handlePrevPage} disabled={!hasPrevious}>
              이전 페이지
            </PageButton>
            <PageButton onClick={handleNextPage} disabled={!hasMore}>
              다음 페이지
            </PageButton>
          </PaginationContainer>
        </>
      )}
    </HomeContainer>
  );
};

export default Home;
