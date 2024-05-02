"use client";
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import "./index.css";
import { getRandomImage } from "@/lib/images";

interface Message {
  sender: string;
  content: string;
  type: string;
  avatarColor?: string;
}

interface Params {
  roomNumber: string;
}

const ChatRoom: React.FC = () => {
  const searchParams = useSearchParams();
  // const { roomNumber } = useParams();
  const username = searchParams.get("username") || "";
  const [imageUrl, setImageUrl] = useState<string>(() => getRandomImage());
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const roomNumber = searchParams.get("quizId") || "";

  console.log(roomNumber);
  console.log(username);
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [roomNumber]);

  const connect = () => {
    console.log("Connecting to chat room...");
    if (username.trim() && roomNumber) {
      const socket = new SockJS("http://localhost:8080/ws");
      const client = Stomp.over(socket);
      client.connect(
        {},
        () => {
          console.log("Connected");
          setConnected(true);
          client.subscribe(`/room/${roomNumber}`, onMessageReceived);
          client.send(
            `/app/chat/${roomNumber}/addUser`,
            {},
            JSON.stringify({
              type: "JOIN",
              sender: {
                username: username,
                imageUrl: imageUrl,
              },
            })
          );
          setStompClient(client);
        },
        (error) => {
          console.error("Error connecting:", error);
        }
      );
    }
  };

  const disconnect = () => {
    if (stompClient) {
      stompClient.disconnect(() => {
        // alert("Disconnected");
        console.log("Disconnected");
      });
      console.log("Disconnected");
    }
  };

  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (message.trim() && stompClient) {
      const chatMessage = { sender: username, content: message, type: "CHAT" };
      stompClient.send(
        `/app/chat/${roomNumber}/sendMessage`,
        {},
        JSON.stringify(chatMessage)
      );
      setMessage("");
    }
  };

  const onMessageReceived = (message: Stomp.Message) => {
    const msg: Message = JSON.parse(message.body);
    setMessages((prevMessages) => [...prevMessages, msg]);
  };

  return (
    <div className="lobby-container flex w-full h-full items-center justify-center z-50">
      <div className="player" key={username}>
        <img src={imageUrl} alt={username} />
        <p>{username}</p>
      </div>
    </div>
  );
};

export default ChatRoom;
