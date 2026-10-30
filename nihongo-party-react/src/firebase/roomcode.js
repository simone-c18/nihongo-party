
import { signInAnonymously } from "firebase/auth";
import { ref, runTransaction, get, onValue } from "firebase/database";
import { auth, database } from "./firebase.js";

// Give each player a unique Firebase ID.
export async function getCurrentPlayer() {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const result = await signInAnonymously(auth);
  return result.user;
}

// Generate a random 6-character room code.
function generateRoomCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}

// Create a new room in Firebase.
export async function createRoom() {
  const user = await getCurrentPlayer();

  for (let attempt = 0; attempt < 10; attempt++) {
    const roomCode = generateRoomCode();
    const roomRef = ref(database, `rooms/${roomCode}`);

    const result = await runTransaction(
      roomRef,
      (existingRoom) => {
        // Don't overwrite an existing room.
        if (existingRoom !== null) {
          return;
        }

        return {
          hostId: user.uid,
          status: "lobby",
          createdAt: Date.now(),
          players: {
            [user.uid]: {
              nickname: "Host",
              avatar: "bear",
              ready: false
            }
          }
        };
      },
      { applyLocally: false }
    );

    if (result.committed) {
      return roomCode;
    }
  }

  throw new Error("Couldn't create a room. Please try again.");
}

// Find an existing room using its code.
export async function findRoom(roomCode) {
  const code = roomCode.trim().toUpperCase();

  // Check that the room code is valid.
  if (!/^[A-Z0-9]{6}$/.test(code)) {
    throw new Error("Please enter a valid 6-character room code.");
  }

  // Sign in before reading Firebase.
  await getCurrentPlayer();

  const roomRef = ref(database, `rooms/${code}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error("Room not found! Check your code.");
  }

  const room = snapshot.val();

  if (room.status !== "lobby") {
    throw new Error("This game has already started.");
  }

  return room;
}

export async function joinRoom(roomCode, nickname = "Player") {
  const code = roomCode.trim().toUpperCase();

  // Check if the room exists.
  const room = await findRoom(code);

  // Only allow up to 4 players.
  if (Object.keys(room.players || {}).length >= 4) {
    throw new Error("This room is full!");
  }

  // Get the current player's Firebase ID.
  const user = await getCurrentPlayer();

  const playerRef = ref(
    database,
    `rooms/${code}/players/${user.uid}`
  );

  // Add this player without overwriting anyone else.
  const result = await runTransaction(playerRef, (existingPlayer) => {
    if (existingPlayer !== null) {
      return;
    }

    return {
      nickname: nickname.trim() || "Player",
      avatar: "bunny",
      ready: false
    };
  }, { applyLocally: false });

  if (!result.committed) {
    throw new Error("You are already in this room!");
  }

  return code;
}

// Listen for changes to a room in real time.
export function listenToRoom(roomCode, onUpdate) {
  const roomRef = ref(database, `rooms/${roomCode}`);

  // Firebase calls onUpdate whenever room data changes.
  const unsubscribe = onValue(roomRef, (snapshot) => {
    onUpdate(snapshot.val());
  });

  return unsubscribe;
}
