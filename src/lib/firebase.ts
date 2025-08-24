import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'cryptoquest-503uk',
  appId: '1:1049525760284:web:4befa74a58f8fba1b5cad9',
  storageBucket: 'cryptoquest-503uk.firebasestorage.app',
  apiKey: 'AIzaSyDSHvp4CU0qdPZFwNx9tBoaH6QOAb0VRFc',
  authDomain: 'cryptoquest-503uk.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '1049525760284'
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
