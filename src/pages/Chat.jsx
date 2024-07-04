import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { auth, db } from '../firebase';
import {
collection, query, where, orderBy, onSnapshot, addDoc,
serverTimestamp, updateDoc, arrayUnion, arrayRemove, doc, getDoc, deleteDoc, getDocs
} from 'firebase/firestore';
import Modal from 'react-modal';
import { Card, Button, Input, Avatar, Spacer } from "@nextui-org/react";
import { FiTrash2, FiX, FiPlus, FiUsers, FiArrowLeft, FiSearch } from 'react-icons/fi';

Modal.setAppElement('#root');

const Chat = () => {
const [user, setUser] = useState(null);
const [friends, setFriends] = useState([]);
const [selectedFriend, setSelectedFriend] = useState(null);
const [messages, setMessages] = useState([]);
const [newMessage, setNewMessage] = useState('');
const [newFriend, setNewFriend] = useState('');
const [isModalOpen, setIsModalOpen] = useState(false);
const [allUsers, setAllUsers] = useState([]);
const [showAllUsers, setShowAllUsers] = useState(false);
const messageEndRef = useRef(null);
const [searchTerm, setSearchTerm] = useState('');
const [friendStatuses, setFriendStatuses] = useState({});

const filteredUsers = useMemo(() => {
  return allUsers.filter(user => 
    user && user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [allUsers, searchTerm]);

const updateUserActivity = useCallback(async (userId, isActive) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isActive: isActive,
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating user activity: ", error);
  }
}, []);

useEffect((user) => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      setUser(user);
      fetchFriends(user.uid);
      updateUserActivity(user.uid, true);
    } else {
      setUser(null);
      setFriends([]);
    }
  });

  return () => {
    unsubscribe();
    if (user) {
      updateUserActivity(user.uid, false);
    }
  };
}, [updateUserActivity]);

useEffect(() => {
  if (user) {
    const friendStatusListeners = friends.map(friend => {
      const friendRef = doc(db, 'users', friend.uid);
      return onSnapshot(friendRef, (doc) => {
        const friendData = doc.data();
        setFriendStatuses(prev => ({
          ...prev,
          [friend.uid]: friendData.isActive
        }));
      });
    });

    return () => {
      friendStatusListeners.forEach(unsubscribe => unsubscribe());
    };
  }
}, [user, friends]);

useEffect(() => {
  if (selectedFriend) {
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) => msg.participants.includes(selectedFriend.uid));
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }
}, [selectedFriend, user]);

useEffect(() => {
  messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

const fetchFriends = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    const friendIds = userData.friends || [];

    const friendPromises = friendIds.map(async (friendId) => {
      const friendRef = doc(db, 'users', friendId);
      const friendSnap = await getDoc(friendRef);
      if (friendSnap.exists()) {
        const friendData = friendSnap.data();
        return { 
          uid: friendId, 
          ...friendData,
          isActive: friendData.isActive || false
        };
      }
      return null;
    });

    const friendsData = await Promise.all(friendPromises);
    setFriends(friendsData.filter(friend => friend !== null));
  }
};

const fetchAllUsers = async () => {
  const usersCollection = collection(db, 'users');
  const userSnapshot = await getDocs(usersCollection);
  const userList = userSnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  }));
  setAllUsers(userList);
};

const handleSendMessage = async () => {
  if (newMessage.trim() === '') return;

  try {
    await addDoc(collection(db, 'messages'), {
      text: newMessage,
      sender: user.uid,
      participants: [user.uid, selectedFriend.uid],
      timestamp: serverTimestamp(),
    });
    setNewMessage('');
  } catch (error) {
    console.error("Error sending message: ", error);
  }
};

const handleAddFriend = async (friendId) => {
  if (!friendId) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      friends: arrayUnion(friendId)
    });

    const friendRef = doc(db, 'users', friendId);
    await updateDoc(friendRef, {
      friends: arrayUnion(user.uid)
    });

    setNewFriend('');
    fetchFriends(user.uid);
  } catch (error) {
    console.error("Error adding friend: ", error);
  }
};

const handleRemoveFriend = async (friendId) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      friends: arrayRemove(friendId)
    });

    const friendRef = doc(db, 'users', friendId);
    await updateDoc(friendRef, {
      friends: arrayRemove(user.uid)
    });

    fetchFriends(user.uid);
    if (selectedFriend && selectedFriend.uid === friendId) {
      setSelectedFriend(null);
    }
  } catch (error) {
    console.error("Error removing friend: ", error);
  }
};

const handleDeleteMessage = async (messageId) => {
  try {
    await deleteDoc(doc(db, 'messages', messageId));
  } catch (error) {
    console.error("Error deleting message: ", error);
  }
};

const handleMouseEnter = (timestamp) => {
  if (!timestamp) return '';

  const date = timestamp.toDate();
  const today = new Date();
  
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString();
  } else {
    return date.toLocaleDateString();
  }
};

if (!user) return <p className="text-lg">Please log in to use the chat.</p>;

return (
  <div className="flex h-screen bg-gray-800 p-20" id="root">
    <Card className="w-1/4 p-4 overflow-y-auto h-full">
      <h3 className="text-xl font-bold mb-2">Friends</h3>
      <Button auto onClick={() => setIsModalOpen(true)}>Add Friend</Button>
      <Spacer y={1} />
      <div className="grid grid-cols-1 gap-4">
        {friends.map((friend) => (
          <div key={friend.uid} className="flex items-center justify-between p-2 border rounded-lg shadow-md cursor-pointer hover:bg-gray-200" onClick={() => setSelectedFriend(friend)}>
            <div className="flex items-center">
              <Avatar src={friend.photoURL} className="w-8 h-8" />
              <span className="ml-2">{friend.displayName}</span>
              <div className={`w-3 h-3 rounded-full ml-2 ${friendStatuses[friend.uid] ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
            <Button
              auto
              color="error"
              className="px-2 py-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFriend(friend.uid);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </Card>

    <Card className="flex-1 p-4 ml-4 h-full flex flex-col max-wh">
      {selectedFriend ? (
        <>
          <div className="flex items-center mb-2">
            <Avatar src={selectedFriend.photoURL} className="w-8 h-8" />
            <h3 className="text-xl font-bold ml-2">{selectedFriend.displayName}</h3>
          </div>
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-2 flex ${message.sender === user.uid ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender !== user.uid && (
                  <Avatar src={selectedFriend.photoURL} className="w-6 h-6 mr-2 self-end" />
                )}
                <div
                  className={`inline-block p-2 rounded-lg relative ${message.sender === user.uid ? 'bg-blue-500 text-black' : 'bg-gray-200 text-black'}`}
                  title={`Sent ${handleMouseEnter(message.timestamp)}`}
                >
                  {message.text}
                </div>
                {message.sender === user.uid && (
                  <FiTrash2
                    className="ml-2 text-red-600 cursor-pointer self-end"
                    onClick={() => handleDeleteMessage(message.id)}
                  />
                )}
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          <div className="flex">
            <Input
              fullWidth
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button auto onClick={handleSendMessage}>Send</Button>
          </div>
        </>
      ) : (
        <p className="text-lg">Select a friend to start chatting</p>
      )}
    </Card>

<Modal
 isOpen={isModalOpen}
 onRequestClose={() => setIsModalOpen(false)}
 contentLabel="Add Friend Modal"
 className="fixed inset-0 flex items-center justify-center"
 overlayClassName="fixed inset-0 bg-black bg-opacity-75"
>
 <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
   <div className="flex justify-between items-center mb-4">
     <h4 className="text-xl font-bold text-white">Add a new friend</h4>
     <button 
       onClick={() => setIsModalOpen(false)}
       className="text-white hover:text-gray-300"
     >
       <FiX size={24} />
     </button>
   </div>
   
   {!showAllUsers ? (
     <div className="space-y-4">
       <Input
         clearable
         bordered
         fullWidth
         color="primary"
         placeholder="Friend's UID"
         value={newFriend}
         onChange={(e) => setNewFriend(e.target.value)}
       />
       <Button auto onClick={() => handleAddFriend(newFriend)}>
         Add Friend
       </Button>
       <Button 
         auto 
         icon={<FiUsers />} 
         style={
           {margin: '5px'}
         }
         onClick={() => {
           fetchAllUsers();
           setShowAllUsers(true);
         }}
       >
         All Users
       </Button>
     </div>
   ) : (
     <div className="space-y-4">
       <Button
         light
         icon={<FiArrowLeft />}
         onClick={() => setShowAllUsers(false)}
         className="mb-4"
       >
         Back
       </Button>
       <div className="relative">
         <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
         <input
           type="text"
           placeholder="Search users..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
         />
       </div>
       <div className="max-h-60 overflow-y-auto">
         {filteredUsers.map((user) => (
           <div key={user.uid} className="flex items-center justify-between py-2 border-b border-gray-700">
             <div className="flex items-center">
               <Avatar src={user.photoURL} size="sm" />
               <span className="ml-2 text-white">{user.displayName}</span>
             </div>
             <button
               onClick={() => handleAddFriend(user.uid)}
               className="text-white hover:text-gray-300 focus:outline-none"
             >
               <FiPlus size={24} />
             </button>
           </div>
         ))}
       </div>
     </div>
   )}
 </div>
</Modal>
  </div>
);
};

export default Chat;