import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const searchPosts = async (searchTerm: string) => {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('title', '>=', searchTerm), where('title', '<=', searchTerm + '\uf8ff'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const searchBooks = async (searchTerm: string) => {
  const apiKey = 'AIzaSyCoRlmU7T9b9EbzE_k2hrWqwPxbpB20hZw';
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchTerm}&key=${apiKey}`);
  const data = await response.json();
  return data.items || [];
};