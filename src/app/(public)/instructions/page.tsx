"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import "./index.css";
import { getRandomImage, images } from "@/lib/images";
import toast from "react-hot-toast";
import { Edit } from "lucide-react";
import { ImageForm } from "../_components/image-form";

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
  const [imageUrl, setImageUrl] = useState<string>(images[0]);
  const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const roomNumber = searchParams.get("quizId") || "";

  const connect = () => {
    console.log("Connecting to chat room...");
    if (username.trim() && roomNumber) {
      toast.loading("Connecting to room...");
      const socket = new SockJS("http://localhost:8080/ws");
      const client = Stomp.over(socket);
      client.connect(
        {},
        () => {
          toast.remove();
          toast.success("Connected to room");
          console.log("Connected");
          setConnected(true);
          // client.subscribe(`/room/${roomNumber}`, onMessageReceived);
          console.count("Connected to room");
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
          toast.remove();
          toast.error("Error connecting to room");
          console.error("Error connecting:", error);
        }
      );
    }
  };
  const disconnect = useCallback(() => {
    if (stompClient) {
      stompClient.disconnect(() => {
        // alert("Disconnected");
        console.log("Disconnected");
      });
      console.log("Disconnected");
    }
  }, []);

  console.log(roomNumber);
  console.log(username);
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [disconnect, roomNumber]);

  return (
    <div className="lobby-container flex w-full h-full items-center justify-center z-50">
      <div className="player" key={username}>
        <div className="relative">
          <ImageForm
            imageUrl={imageUrl}
            onImageChange={(newImageUrl: string) => {
              console.log(newImageUrl);
              setImageUrl(newImageUrl);
              stompClient?.send(
                `/app/chat/${roomNumber}/updateUser`,
                {},
                JSON.stringify({
                  type: "UPDATE",
                  sender: {
                    username: username,
                    imageUrl: newImageUrl,
                  },
                })
              );
            }}
          >
            <div className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full cursor-pointer">
              <Edit className="w-6 h-6 m-1" />
            </div>
          </ImageForm>
          <img src={imageUrl} alt={username} />
        </div>
        <p>{username}</p>
      </div>
    </div>
  );
};

export default ChatRoom;
