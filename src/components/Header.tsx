import React from 'react';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

const HeaderContainer = styled.header`
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <TopSection>
        <Logo to="/">커뮤니티</Logo>
        <SearchContainer>
          <SearchInput type="text" placeholder="검색어를 입력하세요..." />
        </SearchContainer>
        <AuthButtons>
          <LoginButton to="/login">로그인</LoginButton>
          <SignupButton to="/signup">회원가입</SignupButton>
        </AuthButtons>
      </TopSection>
      <BottomSection>
        <WriteButton to="/write">글쓰기</WriteButton>
      </BottomSection>
    </HeaderContainer>
  );
};

export default Header;