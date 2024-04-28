import React from "react";
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

const Lobby = ({ searchParams }: { searchParams: { gamepin: string } }) => {
  const players: Player[] = demoPlayers || [];
  return (
    <section className="home">
      <div className="header">
        <header className="lobby-header">
          <div className="top-left-icon">
            <FaGlobe /> <h3 className="font-semibold"> EN</h3>
          </div>
          <div className="text">
            <h3>Game PIN: {searchParams.gamepin}</h3>
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
      {!players || players.length == 0 ? (
        <div className="players !rounded-sm !py-5">
          <p>Waiting for Players...</p>
        </div>
      ) : (
        <div className="playersss">
          {players.map((player) => (
            <div className="player" key={player.username}>
              <img src={player.image} alt={player.username} />
              <p>{player.username}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Lobby;
