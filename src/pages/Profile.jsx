import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Card, CardHeader, CardBody, Avatar, Input, Button, Spacer } from "@nextui-org/react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    occupation: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile({
            displayName: user.displayName || '',
            ...userDoc.data()
          });
        } else {
          setProfile({
            ...profile,
            displayName: user.displayName || ''
          });
        }
      }
    });

    return () => unsubscribe();
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (user) {
      try {
        await updateProfile(user, { displayName: profile.displayName });
        await setDoc(doc(db, 'users', user.uid), {
          firstName: profile.firstName,
          lastName: profile.lastName,
          bio: profile.bio,
          location: profile.location,
          occupation: profile.occupation
        }, { merge: true });
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving profile:", error);
      }
    }
  };

  if (!user) return <div className="text-foreground">Loading...</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="max-w-2xl w-full bg-content1">
        <CardHeader className="flex-col items-center pb-0 pt-5">
          <Avatar
            src={user.photoURL}
            alt={profile.displayName}
            className="w-20 h-20 text-large"
          />
          <Spacer y={4} />
          <h2 className="text-2xl font-bold text-foreground">{profile.displayName || 'No Name Set'}</h2>
          <p className="text-foreground-500">{user.email}</p>
        </CardHeader>
        <CardBody className="flex-col items-center text-foreground">
          {isEditing ? (
            <>
              <Input
                name="displayName"
                value={profile.displayName}
                onChange={handleChange}
                placeholder="Display Name"
                className="max-w-xs mb-2"
              />
              <Input
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="max-w-xs mb-2"
              />
              <Input
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="max-w-xs mb-2"
              />
              <Input
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Bio"
                className="max-w-xs mb-2"
              />
              <Input
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="Location"
                className="max-w-xs mb-2"
              />
            </>
          ) : (
            <>
              <p className='text-xl'>{profile.firstName + " " + profile.lastName|| 'Not set'}</p>
              <p className='text-foreground-500'>{profile.bio || 'No bio set'}</p><br></br>
              <p><strong>Location:</strong> {profile.location || 'Not set'}</p>
            </>
          )}
          <Spacer y={4} />
          {isEditing ? (
            <Button color="primary" onClick={handleSave}>Save Changes</Button>
          ) : (
            <Button color="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;