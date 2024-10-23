import React from 'react';
import { useNavigate } from 'react-router-dom';

interface WriteProps {
  user: any;
}

const Write: React.FC<WriteProps> = ({ user }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // 리다이렉트 중에는 아무것도 렌더링하지 않음
  }

  return (
    <div>
      <h1>글쓰기</h1>
      {/* 글쓰기 폼을 여기에 추가 */}
    </div>
  );
};

export default Write;