import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            uid: user.uid,
          }, { merge: true });
        } catch (error) {
          console.error("Error saving user to Firestore:", error);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {user ? (
        <div>
          <p>Hello, {user.displayName || 'User'}!</p>
          <p>Your email: {user.email}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default Home;