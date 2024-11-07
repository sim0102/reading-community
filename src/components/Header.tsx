import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, UserInfo, getAuth } from 'firebase/auth';

const HeaderContainer = styled.header`
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
`;

const SearchContainer = styled.div`
  flex-grow: 1;
  max-width: 400px;
  margin: 0 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const AuthButton = styled(Link)`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
`;

const LoginButton = styled(AuthButton)`
  background-color: #007bff;
  color: white;

  &:hover {
    background-color: #0056b3;
  }
`;

const SignupButton = styled(AuthButton)`
  background-color: #28a745;
  color: white;

  &:hover {
    background-color: #218838;
  }
`;

const LogoutButton = styled(AuthButton)`
  background-color: #dc3545;
  color: white;
`;

const BottomSection = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 1rem;
  border-top: 1px solid #ddd;
  max-width: 1200px;
  margin: 0 auto;
`;

const WriteButton = styled(Link)`
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

interface HeaderProps {
  user: UserInfo | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  const handleWrite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.uid) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    } else {
      navigate('/write');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() === '') return;
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <HeaderContainer>
      <TopSection>
        <Logo to='/'>커뮤니티</Logo>
        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchInput
              type='text'
              placeholder='검색어를 입력하세요...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </SearchContainer>
        <AuthButtons>
          {user ? null : <LoginButton to='/login'>로그인</LoginButton>}
          {user ? null : <SignupButton to='/signup'>회원가입</SignupButton>}
          {user ? (
            <LogoutButton to={'/'} onClick={handleLogout}>
              로그아웃
            </LogoutButton>
          ) : null}
        </AuthButtons>
      </TopSection>
      <BottomSection>
        <WriteButton to='/category/독후감'>독후감</WriteButton>
        <WriteButton to='/category/독서 모임'>독서 모임</WriteButton>
        <WriteButton to='/category/자유 게시판'>자유 게시판</WriteButton>
        <WriteButton to='/write' onClick={handleWrite}>
          글쓰기
        </WriteButton>
      </BottomSection>
    </HeaderContainer>
  );
};

export default Header;
