"use client";
import React, { useState, useEffect, useRef } from "react";
import "./lobby.css";
import { FaGlobe, FaAngleUp, FaUser, FaUnlockAlt } from "react-icons/fa";

type Player = {
  id?: number;
  username: string;
  image: string;
};

const demoPlayers: Player[] = [
  {
    username: "Player 1",
    image: "/players/profile1.png",
  },
  {
    username: "Player 2",
    image: "/players/profile2.png",
  },
  {
    username: "Player 3",
    image: "/players/profile3.png",
  },
  {
    username: "Player 4",
    image: "/players/profile4.webp",
  },
  {
    username: "Player 5",
    image: "/players/profile5.webp",
  },
];

const Lobby = ({ searchParams }: { searchParams: { quizId: string } }) => {
  const players: Player[] = demoPlayers || [];
  return (
    <section className="home">
      <div className="header">
        <header className="lobby-header">
          <div className="top-left-icon">
            <FaGlobe /> <h3 className="font-semibold"> EN</h3>
          </div>
          <div className="text">
            <h3>Game PIN: {searchParams.quizId}</h3>
          </div>
          <div className="absolute left-3 size-6 rounded-full bg-white flex items-center justify-center cursor-pointer">
            <FaAngleUp />
          </div>
        </header>
      </div>

      <div className="lobby-container">
        <div className="number">
          <FaUser />
          <h3>0</h3>
        </div>
        <div className="Kahoot">
          <img src="/KahootLogo_Full_white.png" alt="" />
        </div>
        <div className="rightside">
          <div className="mr-5 size-6 rounded-full bg-white flex items-center justify-center cursor-pointer">
            <FaUnlockAlt />
          </div>
          <button className="start">Start</button>
        </div>
      </div>
      <ChatRoom roomNumber={searchParams.quizId} />
    </section>
  );
};

export default Lobby;

import SockJS from "sockjs-client";
import Stomp from "stompjs";

type LiveUser = {
  username: string;
  imageUrl: string;
};

function ChatRoom({ roomNumber }: { roomNumber: string }) {
  const [activeUsers, setActiveUsers] = useState<LiveUser[]>([]);
  const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    // Establish the WebSocket connection
    const socket = new SockJS("http://localhost:8080/ws");
    const client = Stomp.over(socket);
    setStompClient(client);
    client.connect(
      {},
      () => {
        console.log("Connected");
        setConnected(true); // Update connected status
        client.subscribe(`/room/${roomNumber}/activeUsers`, onMessageReceived);
        client.send(
          `/app/chat/${roomNumber}/getUsers`,
          {},
          JSON.stringify({ type: "GET" })
        );
      },
      (error) => {
        console.error("Error connecting:", error);
      }
    );

    return () => {
      // Clean up the WebSocket connection on component unmount
      if (client && connected) {
        client.disconnect(() => {
          // alert("Disconnected");
          console.log("Disconnected");
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomNumber]); // Reconnect if roomNumber changes

  const onMessageReceived = (message: Stomp.Message) => {
    const users: LiveUser[] = JSON.parse(message.body);
    setActiveUsers(users); // Update the active users list
    // alert("Active users" + message.body);
    console.log("Active users", users);
  };
  const removeUser = (user: LiveUser) => {
    // Remove the user from the active users list in server session
    setActiveUsers((prevUsers) =>
      prevUsers.filter((u) => u.username !== user.username)
    );
  };
  if (!connected) {
    return <div>Connecting...</div>;
  }
  console.log(`ActiveUsers: `, activeUsers);
  return !activeUsers || activeUsers.length == 0 ? (
    <div className="players !rounded-sm !py-5">
      <p>Waiting for Players...</p>
    </div>
  ) : (
    <div className="playersss">
      {Array.from(activeUsers).map((user) => (
        <div
          className="player hover:bg-red-500"
          key={user.username}
          onClick={() => removeUser(user)}
        >
          <img src={user.imageUrl} alt={user.username} />
          <p>{user.username}</p>
        </div>
      ))}
    </div>
  );
}
