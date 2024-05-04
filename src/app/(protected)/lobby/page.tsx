"use client";
import React, { useState, useEffect, useRef } from "react";
import "./lobby.css";
import { FaGlobe, FaAngleUp, FaUser, FaUnlockAlt } from "react-icons/fa";
import ChatRoom from "@/components/lobby/ChatRoom";
import PlayerCount from "@/components/lobby/PlayerCount";

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
          <PlayerCount />
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
