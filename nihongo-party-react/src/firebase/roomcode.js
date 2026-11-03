
import { signInAnonymously } from "firebase/auth";
import {
  ref,
  runTransaction,
  get,
  onValue
} from "firebase/database";
import { auth, database } from "./firebase.js";

const CHARACTERS = ["bear", "bunny", "cat", "fox"];

export async function getCurrentPlayer() {
  if (auth.currentUser) return auth.currentUser;

  const result = await signInAnonymously(auth);
  return result.user;
}

function generateRoomCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters[
      Math.floor(Math.random() * characters.length)
    ];
  }

  return code;
}

export async function createRoom() {
  const user = await getCurrentPlayer();

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateRoomCode();
    const roomRef = ref(database, `rooms/${code}`);

    const result = await runTransaction(
      roomRef,
      (room) => {
        if (room !== null) return;

        return {
          hostId: user.uid,
          status: "lobby",
          createdAt: Date.now(),
          players: {
            [user.uid]: {
              nickname: "Host",
              ready: false
            }
          }
        };
      },
      { applyLocally: false }
    );

    if (result.committed) return code;
  }

  throw new Error("Could not create a room.");
}

export async function findRoom(roomCode) {
  const code = roomCode.trim().toUpperCase();

  if (!/^[A-Z0-9]{6}$/.test(code)) {
    throw new Error("Enter a valid 6-character code.");
  }

  await getCurrentPlayer();

  const snapshot = await get(
    ref(database, `rooms/${code}`)
  );

  if (!snapshot.exists()) {
    throw new Error("Room not found!");
  }

  const room = snapshot.val();

  if (room.status !== "lobby") {
    throw new Error("This game has already started.");
  }

  return room;
}

export async function joinRoom(roomCode, nickname = "Player") {
  const code = roomCode.trim().toUpperCase();
  const room = await findRoom(code);
  const user = await getCurrentPlayer();

  if (room.players?.[user.uid]) {
    return code;
  }

  if (Object.keys(room.players || {}).length >= 4) {
    throw new Error("This room is full!");
  }

  const playerRef = ref(
    database,
    `rooms/${code}/players/${user.uid}`
  );

  const result = await runTransaction(
    playerRef,
    (existingPlayer) => {
      if (existingPlayer !== null) return;

      return {
        nickname: nickname.trim().slice(0, 20) || "Player",
        ready: false
      };
    },
    { applyLocally: false }
  );

  if (!result.committed) {
    throw new Error("Could not join the room.");
  }

  return code;
}

export async function claimCharacter(roomCode, character) {
  const code = roomCode.trim().toUpperCase();

  if (!CHARACTERS.includes(character)) {
    throw new Error("Invalid character.");
  }

  const user = await getCurrentPlayer();
  const room = await findRoom(code);

  if (!room.players?.[user.uid]) {
    throw new Error("You must join the room first.");
  }

  const claimsRef = ref(
    database,
    `rooms/${code}/characterClaims`
  );

  const snapshot = await get(claimsRef);
  const claims = snapshot.val() || {};

  const currentCharacter = CHARACTERS.find(
    (name) => claims[name] === user.uid
  );

  if (currentCharacter === character) {
    return character;
  }

  // Release the previous character before switching.
  if (currentCharacter) {
    const oldRef = ref(
      database,
      `rooms/${code}/characterClaims/${currentCharacter}`
    );

    const released = await runTransaction(
      oldRef,
      (owner) => {
        if (owner !== user.uid) return;
        return null;
      },
      { applyLocally: false }
    );

    if (!released.committed) {
      throw new Error("Could not switch characters.");
    }
  }

  const characterRef = ref(
    database,
    `rooms/${code}/characterClaims/${character}`
  );

  const result = await runTransaction(
    characterRef,
    (owner) => {
      if (owner === null) return user.uid;
      return;
    },
    { applyLocally: false }
  );

  if (!result.committed) {
    throw new Error("That character is already taken!");
  }

  return character;
}

export function listenToRoom(roomCode, onUpdate) {
  const roomRef = ref(database, `rooms/${roomCode}`);

  return onValue(roomRef, (snapshot) => {
    onUpdate(snapshot.val());
  });
}
