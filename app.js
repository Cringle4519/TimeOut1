import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// USE YOUR REAL CONFIG (you posted this):
const firebaseConfig = {
  apiKey: "AIzaSyC3Ga-GhV8xQztnbef7ybPFu4BRtLANtuk",
  authDomain: "unbrokenpath-630b0.firebaseapp.com",
  projectId: "unbrokenpath-630b0",
  storageBucket: "unbrokenpath-630b0.firebasestorage.app",
  messagingSenderId: "147188865145",
  appId: "1:147188865145:web:ff1f35a732bf89b31e1ca8",
  measurementId: "G-0Y8G7SS1BV"
};

// One fixed app ID used in Firestore paths
const APP_ID = "unbroken-path-app";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $status = document.getElementById("status");
const $uid = document.getElementById("uid");
const $list = document.getElementById("list");
const $add = document.getElementById("add");
const $refresh = document.getElementById("refresh");

$status.textContent = "Signing in anonymously…";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    await signInAnonymously(auth);
    return;
  }
  $status.innerHTML = '<span class="ok">Connected ✅</span>';
  $uid.textContent = "User ID: " + user.uid;
  await refreshList();
});

function meetingsCol() {
  return collection(db, `artifacts/${APP_ID}/public/data/meetings`);
}

async function addSampleMeeting() {
  await addDoc(meetingsCol(), {
    title: "Sample Meeting " + new Date().toLocaleString(),
    createdAt: serverTimestamp()
  });
}

async function refreshList() {
  const snap = await getDocs(meetingsCol());
  const items = [];
  snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
  $list.textContent = items.length ? JSON.stringify(items, null, 2) : "(none yet)";
}

$add.addEventListener("click", async () => {
  try {
    await addSampleMeeting();
    await refreshList();
  } catch (e) {
    $status.innerHTML = '<span class="bad">Write failed ❌ (see console)</span>';
    console.error(e);
  }
});
$refresh.addEventListener("click", refreshList);
