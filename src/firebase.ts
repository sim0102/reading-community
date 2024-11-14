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
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getFirestore,
  startAfter,
  setDoc,
  endBefore,
  limitToLast,
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

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

// Book 인터페이스 정의
interface Book {
  id: string;
  title: string;
  authors?: string[];
  thumbnail?: string;
}

interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  book?: Book | null;
  createdAt: any;
}

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
            title: book.title,
            authors: book.authors,
            thumbnail: book.thumbnail,
          }
        : null,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('게시물 작성 중 오류 발생:', error);
    throw error;
  }
};

// 게시물 목록 조회 함수
export const getPosts = async (
  category?: string,
  pageSize: number = 12,
  cursor?: any,
  direction: 'next' | 'prev' = 'next'
) => {
  try {
    let q;
    const baseQuery = [
      ...(category && category !== '전체'
        ? [where('category', '==', category)]
        : []),
      orderBy('createdAt', 'desc'),
    ];

    // 첫 페이지 쿼리
    const firstPageQuery = query(
      collection(db, 'posts'),
      ...baseQuery,
      limit(1)
    );
    const firstPageSnapshot = await getDocs(firstPageQuery);
    const firstPageDoc = firstPageSnapshot.docs[0];

    if (cursor) {
      if (direction === 'next') {
        q = query(
          collection(db, 'posts'),
          ...baseQuery,
          startAfter(cursor),
          limit(pageSize)
        );
      } else {
        q = query(
          collection(db, 'posts'),
          ...baseQuery,
          endBefore(cursor),
          limitToLast(pageSize)
        );
      }
    } else {
      q = query(collection(db, 'posts'), ...baseQuery, limit(pageSize));
    }

    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;

    // 결과가 없으면 빈 배열 반환
    if (docs.length === 0) {
      return {
        posts: [],
        firstDoc: null,
        lastDoc: null,
        hasMore: false,
        hasPrevious: false,
        isFirstPage: true,
      };
    }

    const posts = await Promise.all(
      docs.map(async (document) => {
        const postData = document.data();
        const userDocRef = doc(db, 'users', postData.userId);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data();

        return {
          id: document.id,
          ...postData,
          authorName: userData?.displayName || userData?.email || '익명',
        };
      })
    );

    const isFirstPage = firstPageDoc?.id === docs[0]?.id;
    const hasMore = posts.length === pageSize;

    return {
      posts,
      firstDoc: docs[0] || null,
      lastDoc: docs[docs.length - 1] || null,
      hasMore,
      hasPrevious: !isFirstPage,
      isFirstPage,
    };
  } catch (error) {
    console.error('게시물 목록 가져오기 중 오류 발생:', error);
    return {
      posts: [],
      firstDoc: null,
      lastDoc: null,
      hasMore: false,
      hasPrevious: false,
      isFirstPage: true,
    };
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
export const getPost = async (postId: string): Promise<Post> => {
  try {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (postDoc.exists()) {
      const postData = postDoc.data();
      const userDocRef = doc(db, 'users', postData.userId);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();

      return {
        id: postDoc.id,
        userId: postData.userId,
        title: postData.title,
        content: postData.content,
        category: postData.category,
        authorName: userData?.displayName || userData?.email || '익명',
        book: postData.book,
        createdAt: postData.createdAt,
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
  content: string,
  category: string,
  book: Book | null
) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      title,
      content,
      category,
      book: book
        ? {
            id: book.id,
            title: book.title,
            authors: book.authors,
            thumbnail: book.thumbnail,
          }
        : null,
      updatedAt: serverTimestamp(),
    });
    console.log('게시물이 성공적으로 수정되었습니다.');
  } catch (error) {
    console.error('게시물 수정 중 오류 발생:', error);
    throw error;
  }
};
