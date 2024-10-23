import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, updateProfile } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1t4ZHfgzELA4rqTUe3tOkJIT7wlgugzc",
  authDomain: "my-communitypage.firebaseapp.com",
  projectId: "my-communitypage",
  storageBucket: "my-communitypage.appspot.com",
  messagingSenderId: "422033671027",
  appId: "1:422033671027:web:a47ab915943e10fff9fb06",
  measurementId: "G-8WMPK0ZF31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Auth 초기화 및 소셜 로그인 제공자 설정
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Firestore 초기화
export const db = getFirestore(app);
// if (process.env.NODE_ENV === 'development') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   console.log('Connected to Firestore emulator');
// }
// Storage 초기화
export const storage = getStorage(app);

// Analytics 내보내기
export { analytics };

// 회원가입 함수
export const signUp = async (email: string, password: string, nickname: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: nickname });
    await saveUserNickname(user.uid, nickname);
    
    await user.reload();
    console.log("사용자 정보 새로고침 후 닉네임:", user.displayName);
    
    return userCredential;
  } catch (error) {
    console.error("회원가입 중 오류 발생:", error);
    throw error;
  }
};

// 사용자 닉네임 저장 함수
export const saveUserNickname = async (userId: string, nickname: string) => {
  try {
    await setDoc(doc(db, "users", userId), {
      nickname: nickname
    });
    console.log("Firestore에 닉네임 저장 성공");
  } catch (error) {
    console.error("Firestore에 닉네임 저장 중 오류 발생:", error);
    throw error;
  }
};

// 로그인 함수
export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// 로그아웃 함수
export const logOut = () => {
  return signOut(auth);
};
