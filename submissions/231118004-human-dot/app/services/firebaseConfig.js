import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDrVHOtDAnLNTfaGvl2MZ_VEFk7M6TwiwE',
  authDomain: 'nokta-expert.firebaseapp.com',
  databaseURL: 'https://nokta-expert-default-rtdb.firebaseio.com',
  projectId: 'nokta-expert',
  storageBucket: 'nokta-expert.firebasestorage.app',
  messagingSenderId: '141372619782',
  appId: '1:141372619782:web:388d4b0b2e132471bfd787',
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
