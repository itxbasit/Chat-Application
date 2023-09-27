import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  increment,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcmSB8xFyJkmtCREOsGVVOpX7_BgQtAkk",
  authDomain: "authentication-login-adbe3.firebaseapp.com",
  projectId: "authentication-login-adbe3",
  storageBucket: "authentication-login-adbe3.appspot.com",
  messagingSenderId: "899637535399",
  appId: "1:899637535399:web:ebd40c5db3d511c50db182",
  measurementId: "G-J2ZKKZ5085",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage();

const name = document.getElementById("name");
const email = document.getElementById("email");
const pass = document.getElementById("password");
const regBtn = document.getElementById("regBtn");
const userProfile = document.getElementById("src-profile");

regBtn &&
  regBtn.addEventListener("click", (e) => {
    createUserWithEmailAndPassword(auth, email.value, pass.value)
      .then(async (userCredential) => {
        try {
          const user = userCredential.user;
          await setDoc(doc(db, "users", user.uid), {
            name: name.value,
            email: email.value,
          });
          location.href = "index.html";

        } catch (e) {
          console.log();
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("error===" , error)
      });
  });

const loginBtn = document.getElementById("login-btn");

loginBtn?.addEventListener("click", () => {
  const emailLogin = document.getElementById("email-login");
  const passwordLogin = document.getElementById("password-login");
  signInWithEmailAndPassword(auth, emailLogin.value, passwordLogin.value)
    .then(async (userCredential) => {
      // Signed in
      const user = userCredential.user;
      localStorage.setItem("uid", user.uid);
      location.href = "profile.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
});

const userProfileHeader = document.getElementById("user-profile-header");
const nameHeader = document.getElementById("name-header");
const emailHeader = document.getElementById("email-header");

const getUserData = async (uid) => {
  const nameProfile = document.getElementById("name-profile");
  const emailProfile = document.getElementById("email-profile");
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    if (location.pathname === "/profile.html") {
      console.log(docSnap.data().name + "  " + docSnap.data().email);
      nameProfile.value = docSnap.data().name;
      emailProfile.value = docSnap.data().email;
      if (docSnap.data().picture != undefined) {
        userProfile.src = docSnap.data().picture;
      }
    } else if (docSnap.data().picture == "") {
      nameProfile.innerHTML = docSnap.data().name;
      emailProfile.innerHTML = docSnap.data().email;
      if (docSnap.data().picture) {
        userProfile.src = docSnap.data().picture;
      }
    }
  } else {
    // docSnap.data() will be undefined in this case
    console.log();
  }
};

onAuthStateChanged(auth, (user) => {
  const uid = localStorage.getItem("uid");
  if (user && uid) {
    console.log(user);
    getUserData(user.uid);
    getAllUsers(user.email);
    if (
      location.pathname !== "/profile.html" &&
      location.pathname !== "/chat.html"
    ) {
      location.href = "profile.html";
    }
  } else {
    if (
      location.pathname !== "/index.html" &&
      location.pathname !== "/register.html"
    ) {
      location.href = "index.html";
    }
  }
});

const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    if (file) {
      if (
        file.type.slice(6) == "png" ||
        file.type.slice(6) == "jpeg" ||
        file.type.slice(6) == "jpg"
      ) {
        let name = file.name;
        const mountainsRef = ref(storage, `images/${name}`);
        const uploadTask = uploadBytesResumable(mountainsRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Image should be in 'PNG, JPEG or JPG' format",
        });
      }
    }
  });
};

const fileInput = document.getElementById("file-input");

fileInput?.addEventListener("change", async () => {
  if (
    fileInput.files[0].type === "image/jpg" ||
    fileInput.files[0].type === "image/png" ||
    fileInput.files[0].type === "image/jpeg"
  ) {
    try {
      userProfile.src = URL.createObjectURL(fileInput.files[0]);
    } catch (err) {
      console.log(err);
    }
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Image should be in 'PNG, JPEG or JPG' format",
    });
  }
});

const updateProfile = document.getElementById("update");

updateProfile &&
  updateProfile.addEventListener("click", async () => {
    let uid = localStorage.getItem("uid");
    let fullName = document.getElementById("name-profile");
    let email = document.getElementById("email-profile");
    if (fileInput.files[0]) {
      const imageUrl = await uploadFile(fileInput.files[0]);
      const washingtonRef = doc(db, "users", uid);
      await updateDoc(washingtonRef, {
        name: fullName.value,
        email: email.value,
        picture: imageUrl,
      });
    } else {
      const washingtonRef = doc(db, "users", uid);
      await updateDoc(washingtonRef, {
        name: fullName.value,
      });
    } 
    Swal.fire({
      icon: "success",
      title: "User updated successfully",
    });
  });

const logOut = document.getElementById("log-out");

logOut?.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      localStorage.clear();
      location.href = "index.html";
    })
    .catch((error) => {
      // An error happened.
    });
});

const getAllUsers = async (email) => {
  const q = query(
    collection(db, "users"),
    orderBy("email"),
    where("email", "!=", email)
  );
  const q1 = query(
    collection(db, "users"),
    orderBy("email"),
    where("email", "==", email)
  );
  const q3 = query(collection(db, "groups"));

  onSnapshot(q, (querySnapshot) => {
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ ...doc.data(), uid: doc.id });
    });
    onSnapshot(q1, (querySnapshot) => {
      const currentUser = [];
      querySnapshot.forEach((doc) => {
        currentUser.push({ ...doc.data(), uid: doc.id });
      });
      for (var i = 0; i < currentUser.length; i++) {
        try {
          nameHeader.innerHTML = currentUser[i].name;
          emailHeader.innerHTML = currentUser[i].email;
          if (currentUser[i].picture != undefined) {
            userProfileHeader.src = currentUser[i].picture;
          }
        } catch (e) {
          console.log();
        }
      }
    });

    const chatList = document.getElementById("chat-list");
    try {
      chatList.innerHTML = "";
      for (var i = 0; i < users.length; i++) {
        const { email, name, picture, isActive, notifications, uid } = users[i];
        chatList.innerHTML += `
                      <li onclick="selectChat('${email}','${name}','${picture}','${uid}', '${isActive}')" class="user-container list-group-item d-flex justify-content-between align-items-start">
                         <div class="ms-2 me-auto">
                             <div class="fw-bold">${name}</div>
                             <span class="user-email">${email}</span>
                         </div>
                         ${
                           notifications
                             ? `<span class="badge rounded-pill bg-danger notification-badge">
                        ${notifications}
                       </span>`
                             : ""
                         }
                         <div class="online-dot ${
                           isActive ? "green-dot" : "red-dot"
                         }"></div>
                     </li>`;
      }
    } catch {
      console.log();
    }

    const groupList = document.getElementById("group-list");
    onSnapshot(q3, (querySnapshot) => {
      const groups = [];
      querySnapshot.forEach((doc) => {
        groups.push({ ...doc.data(), uid: doc.id });
      });
      try {
        groupList.innerHTML = "";
        for (var i = 0; i < groups.length; i++) {
          const { name, admin, picture, uid } = groups[i];
          groupList.innerHTML += `<li onclick="selectGroupChat('${admin}','${name}','${picture}','${uid}')"
        class="user-container list-group-item d-flex justify-content-between align-items-start">
        <div class="ms-2 me-auto">
            <div class="fw-bold">${name}
                <i class="fa fa-group" style="font-size:20px; margin:10px;"></i>
            </div>
            <span class="user-email">Admin: <b>${admin}</b></span>
        </div>
    </li>`;
        }
      } catch {
        console.log();
      }
    });
  });
};
let groupId;
const groupChatContainer = document.getElementById("groupChatContainer");
const selectGroupChat = (Admin, fullName, picture, selectedId) => {
  groupInfo.style.display = "none";
  chatContainer.style.display = "none";
  groupId = selectedId;
  let currentUserId = localStorage.getItem("uid");
  let chatID;
  if (currentUserId < groupId) {
    chatID = currentUserId + groupId;
  } else {
    chatID = groupId + currentUserId;
  }
  const selectedUserProfile = document.getElementById("selected-group-profile");
  const selectedfullName = document.getElementById("groupName");
  const selectedAdmin = document.getElementById("adminName");
  selectedfullName.innerHTML = fullName;
  selectedAdmin.innerHTML = Admin;
  if (picture !== "undefined") {
    selectedUserProfile.src = picture;
  } else {
    selectedUserProfile.src = "images/user.png";
  }
  groupChatContainer.style.display = "block";
  getAllMessages(chatID);
};

const groupMessageInput = document.getElementById("group-message-input");

groupMessageInput?.addEventListener("keydown", async (e) => {
  if (e.keyCode === 13) {

    let message = groupMessageInput.value;
    let currentUserId = localStorage.getItem("uid");
    let chatID = currentUserId;
    let name = "";
    const q2 = query(
      collection(db, "users"),
      orderBy("email"),
      where("email", "!=", chatID)
    );
    onSnapshot(q2, async (querySnapshot) => {
      const groups = [];
      querySnapshot.forEach((doc) => {
        groups.push({ ...doc.data(), uid: doc.id });
      });
      for (let i = 0; i < groups.length; i++) {
        if (chatID === groups[i].uid) {
          name = groups[i].name;
        }
      }
      let groupID = ""
      const q3 = query(collection(db, "groups"));
      onSnapshot(q3, async (querySnapshot) => {
        const groups = [];
        querySnapshot.forEach(async (doc) => {
          groups.push({ ...doc.data(), uid: doc.id });
          const groupName = document.getElementById("groupName")
          for (let i = 0; i < groups.length; i++) {
            if (groupName.innerHTML === groups[i].name) {
              groupID = groups[i].uid;
            }
          }
        });
        groupMessageInput.value = "";
        if (message != "") {
          try {
            await addDoc(collection(db, "groupMessages"), {
              groupID,
              message: message,
              chatID: chatID,
              timestamp: serverTimestamp(),
              sender: currentUserId,
              name,
              seen: false,
            });
            groupMessageInput.value = "";
  
            console.log("message sent");
          } catch (err) {
            console.log("Fie ---> ", err);
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        }
        
      });

    });
  }
});


let selectUserId;
const chatContainer = document.getElementById("chatContainer");

const selectChat = async (email, fullName, picture, selectedId, isActive) => {
  groupInfo.style.display = "none";
  groupChatContainer.style.display = "none";
  selectUserId = selectedId;
  const q = query(
    collection(db, "users"),
    orderBy("email"),
    where("email", "==", email)
  );
  const userRef = doc(db, "users", selectedId);
  await updateDoc(userRef, {
    notifications: 0,
  });
  let currentUserId = localStorage.getItem("uid");
  let chatID;
  if (currentUserId < selectUserId) {
    chatID = currentUserId + selectUserId;
  } else {
    chatID = selectUserId + currentUserId;
  }
  const selectedUserProfile = document.getElementById("selected-user-profile");
  const selectedfullName = document.getElementById("selectedfullName");
  const selectedEmail = document.getElementById("selectedEmail");
  selectedfullName.innerHTML = fullName;
  selectedEmail.innerHTML = email;
  if (picture !== "undefined") {
    selectedUserProfile.src = picture;
  } else {
    selectedUserProfile.src = "images/user.png";
  }

  chatContainer.style.display = "block";
  getAllMessages(chatID);
};

const messageInput = document.getElementById("message-input");

messageInput?.addEventListener("keydown", async (e) => {
  if (e.keyCode === 13) {
    let message = messageInput.value;
    if (message != "") {
      let currentUserId = localStorage.getItem("uid");
      let chatID;
      if (currentUserId < selectUserId) {
        chatID = currentUserId + selectUserId;
      } else {
        chatID = selectUserId + currentUserId;
      }
      messageInput.value = "";
      try {
        const docRef = await addDoc(collection(db, "messages"), {
          message: message,
          chatID: chatID,
          timestamp: serverTimestamp(),
          sender: currentUserId,
          receiver: selectUserId,
          seen: false,
        });
        console.log("selectUserId", selectUserId);
        const userRef = doc(db, "users", currentUserId);
        await updateDoc(userRef, {
          notifications: increment(1),
        });
        messageInput.value = "";
        console.log("message sent");
      } catch (err) {
        console.log(err);
      }
    } else {
      alert("error");
    }
  }
});

const getAllMessages = (chatID) => {
  const q = query(
    collection(db, "messages"),
    orderBy("timestamp", "desc"),
    where("chatID", "==", chatID)
  );
  const q1 = query(
    collection(db, "groupMessages"),
    orderBy("timestamp", "desc")
  );
  const chatBox = document.getElementById("chat-box");
  let currentUserId = localStorage.getItem("uid");
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push(doc.data());
    });
    chatBox.innerHTML = "";
    for (var i = 0; i < messages.length; i++) {
      let time = messages[i].timestamp
        ? moment(messages[i].timestamp.toDate()).fromNow()
        : moment().fromNow();
      if (currentUserId === messages[i].sender) {
        chatBox.innerHTML += `<div class="message-box right-message mb-2">
                                     ${messages[i].message}
                                     <br />
                                     <span>${time}</span>
                                    </div>
              `;
      } else {
        chatBox.innerHTML += `
              <div class="message-box left-message mb-2">
              ${messages[i].message}
              <br />
              <span>${time}</span>
               </div>`;
      }
    }
  });

  const groupChatBox = document.getElementById("group-chat-box");
  onSnapshot(q1, (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push(doc.data());
    });
    const groupName = document.getElementById("groupName")
    let groupID = ""
    const q3 = query(collection(db, "groups"));
      onSnapshot(q3, async (querySnapshot) => {
        const groups = [];
        querySnapshot.forEach(async (doc) => {
          groups.push({ ...doc.data(), uid: doc.id });
          const groupName = document.getElementById("groupName")
          for (let i = 0; i < groups.length; i++) {
            if (groupName.innerHTML === groups[i].name) {
              groupID = groups[i].uid;
            }
          }
        });
    groupChatBox.innerHTML = "";
    for (var i = 0; i < messages.length; i++) {
      let time = messages[i].timestamp
        ? moment(messages[i].timestamp.toDate()).fromNow()
        : moment().fromNow();
      if (currentUserId === messages[i].sender && groupID === messages[i].groupID) {
        groupChatBox.innerHTML += `
        <div class="message-box right-message mb-2">
                                    <i>From: <b> ${messages[i].name}</b></i><br>
                                     ${messages[i].message}
                                     <br />
                                     <span>${time}</span>
                                    </div>
              `;
      } else {
        if(groupID === messages[i].groupID){
        groupChatBox.innerHTML += `
              <div class="message-box left-message mb-2">
              <i>From: <b> ${messages[i].name}</b></i><br>
              ${messages[i].message}
              <br />
              <span>${time}</span>
               </div>`;
        }
      }
    }
  });
  });
};

const setActiveStatus = async (status) => {
  let currentUserId = localStorage.getItem("uid");
  const userRef = doc(db, "users", currentUserId);
  await updateDoc(userRef, {
    isActive: status,
  });
};

const group = document.querySelector(".group-list");
const groupInfo = document.querySelector(".group-info");
group?.addEventListener("click", () => {
  groupInfo.style.display = "block";
  chatContainer.style.display = "none";
  groupChatContainer.style.display = "none";
});

const createGroup = document.getElementById("create-group");
const adminName = document.getElementById("admin-name");
const groupName = document.getElementById("group-name");
const groupInput = document.getElementById("file-input");
const groupProfile = document.getElementById("group-profile");

groupInput?.addEventListener("change", () => {
  if (
    groupInput.files[0].type === "image/jpg" ||
    groupInput.files[0].type === "image/png" ||
    groupInput.files[0].type === "image/jpeg"
  ) {
    try {
      // console.log(file)
      groupProfile.src = URL.createObjectURL(groupInput.files[0]);
    } catch (err) {
      console.log();
    }
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Image should be in 'PNG, JPEG or JPG' format",
    });
  }
});

createGroup?.addEventListener("click", async () => {
  const image = await uploadFile(groupInput.files[0]);
  try {
    const docRef = await addDoc(collection(db, "groups"), {
      name: groupName.value,
      admin: adminName.value,
      picture: image,
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error();
  }
  groupInfo.style.display = "none";
});

window.addEventListener("beforeunload", () => {
  try {
    setActiveStatus(false);
  } catch {
    pass;
  }
});

window.addEventListener("focus", () => {
  try {
    setActiveStatus(true);
  } catch {
    pass;
  }
});

window.selectChat = selectChat;
window.selectGroupChat = selectGroupChat;
