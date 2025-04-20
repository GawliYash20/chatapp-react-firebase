import { useEffect, useState } from "react";
import "./addUser.css";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);

  const { currentUser } = useUserStore();
  // search function
  const handleSearch = async (e) => {
    e.preventDefault();
    // gathers the form data(username)
    const formData = new FormData(e.target);
    const username = formData.get("username");
    console.log(username);

    try {
      const userRef = collection(db, "users");

      // Create a query against the collection.
      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    console.log(user);
  }, [user]);

  // adds the data and create the chat and user chats between users with chatID
  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsref = collection(db, "userchats");
  
    try {
      const newChatRef = doc(chatRef);
  
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
  
      // for client who was added
      await setDoc(doc(userChatsref, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      }, { merge: true });
  
      // for client who adds
      await setDoc(doc(userChatsref, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      }, { merge: true });
  
    } catch (err) {
      console.log(err);
    }
  };
  

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
