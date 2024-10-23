import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from '@emotion/styled';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Header from './components/Header';
import Home from './pages/Home';
import Write from './pages/Write';
import Login from './pages/Login';
import Signup from './pages/Signup';

const AppContainer = styled.div`
  font-family: Arial, sans-serif;
`;

const MainContent = styled.main`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

interface UserInfo {
  email: string | null;
  nickname?: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          await currentUser.reload();
          setUser({
            email: currentUser.email,
            nickname: currentUser.displayName || undefined,
          });
          console.log("현재 로그인된 사용자:", currentUser);
        } catch (error) {
          console.error("사용자 정보 새로고침 중 오류 발생:", error);
        }
      } else {
        setUser(null);
        console.log("로그인된 사용자 없음");
      }
    });
  
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <AppContainer>
        <Header/>
        <MainContent>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/write" element={<Write user={user} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
};

export default App;