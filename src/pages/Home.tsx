import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { getPosts } from '../firebase';
import { Timestamp } from 'firebase/firestore';
import { Link, useParams } from 'react-router-dom';
import { Viewer } from '@toast-ui/react-editor';

const HomeContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const PostList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const PostItem = styled.div`
  display: flex;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 10px;
  &:hover {
    background-color: #f8f9fa;
  }
`;

const BookInfo = styled.div`
  width: 120px;
  margin-right: 20px;
  text-align: center;
`;

const BookCover = styled.img`
  width: 100px;
  height: auto;
  margin-bottom: 10px;
`;

const PostContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const PostTitle = styled.h3`
  margin: 0 0 10px 0;
`;

const PostAuthor = styled.span`
  font-size: 0.9em;
  color: #666;
  margin-left: 10px;
`;

const PostExcerpt = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const PostLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const PageButton = styled.button`
  margin: 0 5px;
  padding: 5px 10px;
  border: 1px solid #ddd;
  background-color: ${(props) => (props.active ? '#007bff' : 'white')};
  color: ${(props) => (props.active ? 'white' : 'black')};
  cursor: pointer;
`;

interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: Timestamp;
  category: string;
  book?: {
    title: string;
    thumbnail: string;
  };
}

interface UserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface HomeProps {
  user: UserInfo | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { category } = useParams<{ category?: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const fetchedPosts = await getPosts(category);
        setPosts(fetchedPosts as Post[]);
      } catch (error) {
        console.error('게시물 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  if (loading) {
    return <div>게시물을 불러오는 중...</div>;
  }

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <HomeContainer>
      <h1>{category ? `${category} 게시판` : '전체 게시판'}</h1>
      <p>
        {user
          ? `환영합니다, ${user.displayName || user.email || '사용자'}님!`
          : '로그인해 주세요.'}
      </p>
      <PostList>
        {currentPosts.map((post) => (
          <PostLink to={`/post/${post.id}`} key={post.id}>
            <PostItem>
              {post.book && (
                <BookInfo>
                  <BookCover src={post.book.thumbnail} alt={post.book.title} />
                  <div>{post.book.title}</div>
                </BookInfo>
              )}
              <PostContent>
                <PostTitle>{post.title}</PostTitle>
                <PostAuthor>작성자: {post.authorName}</PostAuthor>
                <PostExcerpt>
                  <Viewer
                    initialValue={post.content.substring(0, 200) + '...'}
                  />
                </PostExcerpt>
              </PostContent>
            </PostItem>
          </PostLink>
        ))}
      </PostList>
      <Pagination>
        {Array.from(
          { length: Math.ceil(posts.length / postsPerPage) },
          (_, i) => (
            <PageButton
              key={i}
              onClick={() => paginate(i + 1)}
              active={currentPage === i + 1}
            >
              {i + 1}
            </PageButton>
          )
        )}
      </Pagination>
    </HomeContainer>
  );
};

export default Home;
