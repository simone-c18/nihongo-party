import { signInAnonymously } from 'firebase/auth';
import { ref, runTransaction, get, onValue, set } from 'firebase/database';
import { auth, database } from './firebase.js';

export const CHARACTERS = ['my-melody', 'kuromi', 'cinnamoroll', 'pochacco'];
const VALID_CODE = /^[A-Z2-9]{6}$/;
const codeOf = (code) => String(code || '').trim().toUpperCase();

export async function getCurrentPlayer() {
  if (auth.currentUser) return auth.currentUser;
  return (await signInAnonymously(auth)).user;
}
function generateRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export async function createRoom() {
  const user = await getCurrentPlayer();

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateRoomCode();
    const roomRef = ref(database, `rooms/${code}`);

    const existing = await get(roomRef);
    if (existing.exists()) continue;

    await set(roomRef, {
      hostId: user.uid,
      status: 'lobby',
      createdAt: Date.now(),
      players: {
        [user.uid]: {
          nickname: 'Host',
          ready: false
        }
      }
    });

    return code;
  }

  throw new Error('Could not create a room.');
}

export async function findRoom(roomCode) {
  const code = codeOf(roomCode);
  if (!VALID_CODE.test(code)) throw new Error('Enter a valid 6-character room code.');
  await getCurrentPlayer();
  const snapshot = await get(ref(database, `rooms/${code}`));
  if (!snapshot.exists()) throw new Error('Room not found!');
  const room = snapshot.val();
  if (room.status !== 'lobby') throw new Error('This game has already started.');
  return room;
}
export async function joinRoom(roomCode, nickname = 'Player') {
  const code = codeOf(roomCode);
  const room = await findRoom(code);
  const user = await getCurrentPlayer();
  if (room.players?.[user.uid]) return code;
  if (Object.keys(room.players || {}).length >= 4) throw new Error('Room is full.');
  const result = await runTransaction(ref(database, `rooms/${code}/players/${user.uid}`), current => {
    if (current !== null) return;
    return { nickname: String(nickname).trim().slice(0, 20) || 'Player', ready: false };
  }, { applyLocally: false });
  if (!result.committed) throw new Error('Could not join the room.');
  return code;
}
export async function claimCharacter(roomCode, character) {
  const code = codeOf(roomCode);
  if (!CHARACTERS.includes(character)) throw new Error('Invalid character.');
  const user = await getCurrentPlayer();
  const room = await findRoom(code);
  if (!room.players?.[user.uid]) throw new Error('Join the room first.');
  const claims = (await get(ref(database, `rooms/${code}/characterClaims`))).val() || {};
  const currentCharacter = CHARACTERS.find(id => claims[id] === user.uid);
  if (currentCharacter === character) return character;
  if (currentCharacter) {
    const released = await runTransaction(ref(database, `rooms/${code}/characterClaims/${currentCharacter}`), owner => owner === user.uid ? null : undefined, { applyLocally: false });
    if (!released.committed) throw new Error('Could not change characters.');
  }
  const result = await runTransaction(ref(database, `rooms/${code}/characterClaims/${character}`), owner => owner === null ? user.uid : undefined, { applyLocally: false });
  if (!result.committed) throw new Error('That character is taken!');
  return character;
}
export function listenToRoom(roomCode, onUpdate, onError) {
  return onValue(ref(database, `rooms/${codeOf(roomCode)}`), snapshot => onUpdate(snapshot.val()), onError);
}
export async function setPlayerPosition(roomCode, x, y) {
  const code = codeOf(roomCode);
  const user = await getCurrentPlayer();
  const boundedX = Math.round(Math.max(6, Math.min(94, x)) * 10) / 10;
  const boundedY = Math.round(Math.max(12, Math.min(91, y)) * 10) / 10;
  await set(ref(database, `rooms/${code}/positions/${user.uid}`), { x: boundedX, y: boundedY });
}
export async function startGame(roomCode) {
  const code = codeOf(roomCode);
  const user = await getCurrentPlayer();
  const room = (await get(ref(database, `rooms/${code}`))).val();
  if (!room || room.hostId !== user.uid) throw new Error('Only the host can start.');
  if (Object.keys(room.players || {}).length < 2) throw new Error('At least two players are required.');
  const result = await runTransaction(ref(database, `rooms/${code}/status`), status => {
    if (status !== 'lobby') return;
    return 'playing';
  }, { applyLocally: false });
  if (!result.committed) throw new Error('Could not start the game. Only the host can start.');
  return user.uid;
}

// One answer per player per question; the database rules enforce membership and immutability.
export async function submitAnswer(roomCode, questionId, answer) {
  const code = codeOf(roomCode);
  const user = await getCurrentPlayer();
  const answerRef = ref(database, `rooms/${code}/answers/${user.uid}/${questionId}`);
  const result = await runTransaction(answerRef, old => old === null ? String(answer) : undefined, { applyLocally: false });
  if (!result.committed) throw new Error('Your answer was already submitted.');
}

// The host advances the shared round after everyone has answered.
export async function advanceRound(roomCode) {
  const code = codeOf(roomCode);
  const user = await getCurrentPlayer();
  const room = (await get(ref(database, `rooms/${code}`))).val();
  if (!room || room.hostId !== user.uid) throw new Error('Only the host can advance.');
  if (room.status !== 'playing') throw new Error('The game has not started.');
  const idx = room.game?.currentIndex || 0;
  const result = await runTransaction(ref(database, `rooms/${code}/game/currentIndex`), old => (old === null && idx === 0) || old === idx ? idx + 1 : undefined, { applyLocally: false });
  if (!result.committed) throw new Error('The question has already advanced.');
}
