import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { signUp } from '../firebase';
import { FirebaseError } from 'firebase/app';

const SignupContainer = styled.div`
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
`;

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;
`;

const Signup: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
  
    try {
      await signUp(email, password, nickname);
      console.log("회원가입 성공");
      navigate('/');
    } catch (error) {
      console.error('회원가입 오류:', error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError('이미 사용 중인 이메일 주소입니다.');
            break;
          case 'auth/invalid-email':
            setError('유효하지 않은 이메일 주소입니다.');
            break;
          case 'auth/weak-password':
            setError('비밀번호가 너무 약합니다. 최소 6자 이상이어야 합니다.');
            break;
          default:
            setError('회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  return (
    <SignupContainer>
      <h1>회원가입</h1>
      <Form onSubmit={handleSubmit}>
        <Input
          type='text'
          placeholder='닉네임'
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <Input
          type='email'
          placeholder='이메일'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type='password'
          placeholder='비밀번호'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type='password'
          placeholder='비밀번호 확인'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type='submit'>가입하기</Button>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </SignupContainer>
  );
};

export default Signup;
