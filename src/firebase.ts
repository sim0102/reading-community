import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  updateProfile,
  signInWithPopup,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { query, orderBy, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB1t4ZHfgzELA4rqTUe3tOkJIT7wlgugzc',
  authDomain: 'my-communitypage.firebaseapp.com',
  projectId: 'my-communitypage',
  storageBucket: 'my-communitypage.appspot.com',
  messagingSenderId: '422033671027',
  appId: '1:422033671027:web:a47ab915943e10fff9fb06',
  measurementId: 'G-8WMPK0ZF31',
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
// Storage 초기화
export const storage = getStorage(app);

// Analytics 내보내기
export { analytics };

// 회원가입 함수
export const signUp = async (
  email: string,
  password: string,
  displayName: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName: displayName });
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName,
    });

    await user.reload();
    console.log('사용자 정보 새로고침 후 닉네임:', user.displayName);

    return userCredential;
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    throw error;
  }
};

// 구글 회원가입 함수
export const signUpWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });

    console.log('구글 회원가입 성공:', user);
    return user;
  } catch (error) {
    console.error('구글 회원가입 중 오류 발생:', error);
    throw error;
  }
};

// 구글 로그인 함수
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('구글 로그인 성공:', user);
    return user;
  } catch (error) {
    console.error('구글 로그인 중 오류 발생:', error);
    throw error;
  }
};

// 사용자 닉네임 저장 함수
export const saveUserNickname = async (userId: string, nickname: string) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      nickname: nickname,
    });
    console.log('Firestore에 닉네임 저장 성공');
  } catch (error) {
    console.error('Firestore에 닉네임 저장 중 오류 발생:', error);
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

// 게시물 작성 함수

export const uploadImage = async (file: File) => {
  const storageRef = ref(storage, 'thumbnails/' + file.name);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const createPost = async (
  userId: string,
  title: string,
  content: string,
  category: string,
  book: Book | null
) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      userId,
      title,
      content,
      category,
      book: book
        ? {
            id: book.id,
            title: book.volumeInfo.title,
            authors: book.volumeInfo.authors,
            thumbnail: book.volumeInfo.imageLinks?.thumbnail,
          }
        : null,
      createdAt: serverTimestamp(),
    });
    console.log('게시물이 성공적으로 작성되었습니다. 문서 ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('게시물 작성 중 오류 발생:', error);
    throw error;
  }
};

export const getPosts = async (category?: string) => {
  try {
    let postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    if (category) {
      postsQuery = query(postsQuery, where('category', '==', category));
    }

    const querySnapshot = await getDocs(postsQuery);

    const posts = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const postData = docSnapshot.data();
        const userDocRef = doc(db, 'users', postData.userId);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data();
        return {
          id: docSnapshot.id,
          ...postData,
          authorName: userData?.displayName || '익명',
          book: postData.book || null,
        };
      })
    );

    return posts;
  } catch (error) {
    console.error('게시물 가져오기 중 오류 발생:', error);
    throw error;
  }
};
// 댓글 작성 함수
export const createComment = async (
  postId: string,
  userId: string,
  content: string
) => {
  try {
    const docRef = await addDoc(collection(db, 'comments'), {
      postId,
      userId,
      content,
      createdAt: serverTimestamp(),
    });
    console.log('댓글이 성공적으로 작성되었습니다. 문서 ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('댓글 작성 중 오류 발생:', error);
    throw error;
  }
};
// 댓글 조회 함수
export const getComments = async (postId: string) => {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const comments = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const commentData = docSnapshot.data();
        const userDocRef = doc(db, 'users', commentData.userId);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data();
        return {
          id: docSnapshot.id,
          ...commentData,
          authorName: userData?.displayName || commentData.authorName || '익명',
        };
      })
    );

    return comments;
  } catch (error) {
    console.error('댓글 가져오기 중 오류 발생:', error);
    throw error;
  }
};
// 댓글 삭제 함수
export const deleteComment = async (commentId: string) => {
  try {
    await deleteDoc(doc(db, 'comments', commentId));
    console.log('댓글이 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('댓글 삭제 중 오류 발생:', error);
    throw error;
  }
};
// 게시물 삭제 함수
export const deletePost = async (postId: string) => {
  try {
    // 게시물 삭제
    await deleteDoc(doc(db, 'posts', postId));
    console.log('게시물이 성공적으로 삭제되었습니다.');

    // 해당 게시물의 댓글 삭제
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, where('postId', '==', postId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log('해당 게시물의 모든 댓글이 삭제되었습니다.');
  } catch (error) {
    console.error('게시물 또는 댓글 삭제 중 오류 발생:', error);
    throw error;
  }
};

// 단일 게시물 조회 함수
export const getPost = async (postId: string) => {
  try {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const userDocRef = doc(db, 'users', postData.userId);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      return {
        id: postDoc.id,
        ...postData,
        authorName: userData?.displayName || userData?.email || '익명',
      };
    } else {
      throw new Error('게시물을 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('게시물 가져오기 중 오류 발생:', error);
    throw error;
  }
};

// 게시물 수정 함수
export const updatePost = async (
  postId: string,
  title: string,
  content: string
) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      title,
      content,
      updatedAt: serverTimestamp(),
    });
    console.log('게시물이 성공적으로 수정되었습니다.');
  } catch (error) {
    console.error('게시물 수정 중 오류 발생:', error);
    throw error;
  }
};
