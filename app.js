// --- HARD TRUTH MODE: fail loudly so we can fix fast ---
window.onerror = (m, s, l, c, e) => console.log('WINDOW ERROR:', m, s, l, c, e);

// Firebase CDN v11.6.1
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ---- CONFIG (your real project; no placeholders) ----
const firebaseConfig = {
  apiKey: "AIzaSyC3Ga-GhV8xQztnbef7ybPFu4BRtLANtuk",
  authDomain: "unbrokenpath-630b0.firebaseapp.com",
  projectId: "unbrokenpath-630b0",
  storageBucket: "unbrokenpath-630b0.firebasestorage.app",
  messagingSenderId: "147188865145",
  appId: "1:147188865145:web:ff1f35a732bf89b31e1ca8",
  measurementId: "G-0Y8G7SS1BV"
};

// We’ll use this same ID in your Firestore path
const APP_ID = "unbroken-path-app";

// ---- UI helpers ----
const $ = (id) => document.getElementById(id);
const setStatus = (t) => { const el = $('status'); if (el) el.textContent = t; };

// ---- Boot ----
setStatus('Booting…');
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

setStatus('Signing in (anonymous)…');

// Sign-in and then load meetings (seeding if empty)
onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  $('user-id').textContent = user.uid;
  setStatus('Signed in. Loading meetings…');

  try {
    const meetingsCol = collection(db, `artifacts/${APP_ID}/public/data/meetings`);
    const snap = await getDocs(meetingsCol);

    if (snap.empty) {
      // Seed one meeting so you see something immediately
      await addDoc(meetingsCol, {
        title: "Welcome Meeting",
        date: new Date().toISOString().slice(0,10),
        time: "12:00",
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });
      setStatus('No meetings found. Seeded a demo meeting. Reloading…');
      // Re-read after seed
      const again = await getDocs(meetingsCol);
      renderMeetings(again);
      setStatus('Ready.');
    } else {
      renderMeetings(snap);
      setStatus('Ready.');
    }
  } catch (e) {
    console.error(e);
    setStatus(`Failed to load meetings: ${e?.message || e}`);
  }
});

// Start sign-in
signInAnonymously(auth).catch(err => setStatus(`Auth error: ${err?.message || err}`));

// ---- Render ----
function renderMeetings(snapshot) {
  const root = $('meetings');
  root.innerHTML = '';
  snapshot.forEach(doc => {
    const m = doc.data();
    const div = document.createElement('div');
    div.className = 'p-3 bg-gray-800 rounded';
    div.innerHTML = `
      <div class="text-white font-medium">${m.title || '(Untitled)'}</div>
      <div class="text-xs text-gray-400">${m.date || ''} ${m.time ? 'at ' + m.time : ''}</div>
    `;
    root.appendChild(div);
  });
  if (root.children.length === 0) {
    root.innerHTML = '<div class="text-gray-400">No meetings</div>';
  }
}
