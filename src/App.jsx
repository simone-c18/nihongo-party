
import React, { useEffect, useState } from "react";
import { createRoom, joinRoom, listenToRoom } from "./roomcode";

export default function App() {
  const [page, setPage] = useState("home");
  const [code, setCode] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHost, setIsHost] = useState(false);

  // Update the lobby whenever Firebase data changes.
  useEffect(() => {
    if (page !== "lobby" || !roomCode) return;

    const unsubscribe = listenToRoom(roomCode, (room) => {
      if (room) {
        setPlayers(Object.values(room.players || {}));
      } else {
        setPlayers([]);
      }
    });

    return () => unsubscribe();
  }, [page, roomCode]);

  async function handleCreateRoom() {
    setLoading(true);
    setError("");

    try {
      const newCode = await createRoom();
      setRoomCode(newCode);
      setIsHost(true);
      setPage("lobby");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom() {
    setLoading(true);
    setError("");

    try {
      const joinedCode = await joinRoom(code, nickname);
      setRoomCode(joinedCode);
      setIsHost(false);
      setPage("lobby");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function goHome() {
    setError("");
    setPlayers([]);
    setPage("home");
  }

  function getAvatar(avatar) {
    if (avatar === "bear") return "🐻";
    if (avatar === "bunny") return "🐰";
    if (avatar === "cat") return "🐱";
    if (avatar === "fox") return "🦊";
    return "🌸";
  }

  return (
    <main className="card">
      {page === "home" ? (
        <>
          <h1>nihongo party 🌸</h1>
          <div className="mascots">🐻 🎀 🐰</div>
          <p>the fun way to learn japanese!</p>

          <button onClick={() => setPage("host")}>
            host game
          </button>

          <button onClick={() => setPage("join")}>
            join room
          </button>
        </>
      ) : page === "join" ? (
        <>
          <h2>join a party 🌸</h2>
          <p>enter your friend's room code!</p>

          <input
            aria-label="room code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="room code"
          />

          <input
            aria-label="nickname"
            maxLength={20}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="your nickname"
          />

          <button onClick={handleJoinRoom} disabled={loading}>
            {loading ? "joining..." : "join party ♡"}
          </button>

          {error && <p role="alert">{error}</p>}

          <button className="back" onClick={goHome}>
            back
          </button>
        </>
      ) : page === "host" ? (
        <>
          <h2>host game 🌸</h2>
          <p>create a room for your friends!</p>

          <button onClick={handleCreateRoom} disabled={loading}>
            {loading ? "creating room..." : "create room ♡"}
          </button>

          {error && <p role="alert">{error}</p>}

          <button className="back" onClick={goHome}>
            back
          </button>
        </>
      ) : (
        <>
          <h1>🌸 nihongo party 🌸</h1>
          <h2>
            {isHost ? "your party is ready!" : "you joined the party!"}
          </h2>

          <p>share this code with your friends ♡</p>

          <div className="room-code-box">
            <p>ROOM CODE</p>
            <h1>{roomCode}</h1>
          </div>

          <h3>players ({players.length} / 4)</h3>

          <div className="player-list">
            {players.map((player, index) => (
              <div className="player-card" key={index}>
                <div className="player-avatar">
                  {getAvatar(player.avatar)}
                </div>
                <p>{player.nickname}</p>
                <span>
                  {player.ready ? "ready! ♡" : "waiting..."}
                </span>
              </div>
            ))}
          </div>

          <p>waiting for everyone to join... ♡</p>

          <button className="back" onClick={goHome}>
            back
          </button>
        </>
      )}
    </main>
  );
}
