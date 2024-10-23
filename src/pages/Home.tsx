import React from 'react';

interface UserInfo {
  email: string | null;
  nickname?: string;
}

interface HomeProps {
  user: UserInfo | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  return (
    <div>
      <h1>홈페이지</h1>
      <p>
        {user
          ? `환영합니다, ${user.nickname || user.email || '사용자'}님!`
          : '로그인해 주세요.'}
      </p>
    </div>
  );
};

export default Home;