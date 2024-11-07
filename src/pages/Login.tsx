import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { signIn, signInWithGoogle } from '../firebase';
import GoogleLogo from '../assets/google-logo';

const LoginContainer = styled.div`
  max-width: 400px;
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
  border-radius: 18px;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  margin-bottom: 10px;
  background-color: #4c545c;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 18px;

  &:hover {
    background-color: #7c8690;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.');
      console.error('로그인 오류:', error);
    }
  };
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      setError('구글 로그인에 실패했습니다.');
      console.error('구글 로그인 오류:', error);
    }
  };

  return (
    <LoginContainer>
      <h1>로그인</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">로그인</Button>
        <Button type="button" onClick={handleGoogleLogin}><GoogleLogo /> 구글로 로그인</Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </LoginContainer>
  );
};

export default Login;