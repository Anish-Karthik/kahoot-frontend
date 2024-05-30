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
import { AdvancedChatMessage, MessageType, Question, Receiver } from "@/types";
import {
  Circle,
  Triangle,
  Square,
  Diamond,
  LucideProps,
  Check,
} from "lucide-react";
import { Slide } from "@/app/(protected)/questionset/create/_components/slides.hook";
import { OptionBar } from "@/app/(protected)/questionset/create/_components/Slide";
import { convertQuestionToSlide } from "@/lib/utils";
const SHAPES = [Triangle, Diamond, Circle, Square];
const COLORS = ["bg-red-600", "bg-blue-600", "bg-yellow-600", "bg-green-600"];
enum ContentType {
  NOT_STARTED = "NOT_STARTED",
  QUESTION = "QUESTION",
  ANSWER = "ANSWER",
  LEADERBOARD = "LEADERBOARD",
  VERDICT = "VERDICT",
  CONTENT = "CONTENT",
}

const ChatRoom: React.FC = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";
  const [imageUrl, setImageUrl] = useState<string>(images[0]);
  const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [contentType, setContentType] = useState<ContentType>(
    ContentType.NOT_STARTED
  );
  const [content, setContent] = useState<React.JSX.Element>();
  const gameCode = searchParams.get("quizId") || "";

  const connect = () => {
    console.log("Connecting to chat room...");
    if (username.trim() && gameCode) {
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
          // client.subscribe(`/room/${gameCode}`, onMessageReceived);
          console.count("Connected to room");
          client.subscribe(`/room/${gameCode}/quiz`, quizEvents);
          client.send(
            `/app/chat/${gameCode}/addUser`,
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

  const quizEvents = (message: Stomp.Message) => {
    const msg: AdvancedChatMessage = JSON.parse(message.body);
    console.log(msg);
    const reciever = msg.receiver;
    if (reciever === Receiver.HOST) {
      return;
    }
    switch (msg.type) {
      case MessageType.ANSWER:
        setContentType(ContentType.VERDICT);
        setContent(
          <div className="flex flex-col gap-2">
            <div className="player" key={username}>
              <div className="relative">
                <img src={imageUrl} alt={username} />
              </div>
              <p>{username}</p>
            </div>
            <h2>
              your score {msg.verdict!.score} answer is{" "}
              {msg.verdict!.correct ? "correct" : "incorrect"}
            </h2>
          </div>
        );
        break;
      case MessageType.QUESTION:
        setContentType(ContentType.QUESTION);
        setContent(
          <QuestionOptions
            slide={convertQuestionToSlide(msg.question!)}
            submitAnswer={(ind: number) => {
              const answer: Partial<AdvancedChatMessage> = {
                type: MessageType.ANSWER,
                sender: {
                  username: username,
                  imageUrl: imageUrl,
                },
                answerIndex: ind,
              };
              stompClient?.send(
                `/app/chat/${gameCode}/answer`,
                {},
                JSON.stringify(answer)
              );
            }}
          />
        );
        break;
      case MessageType.START:
        setContentType(ContentType.CONTENT);
        setContent(<h1>Get ready!</h1>);
        break;
      case MessageType.NEXT:
        break;
      case MessageType.LEADERBOARD:
        break;
      default:
        console.log("Unknown message type", msg);
    }
  };

  console.log(gameCode);
  console.log(username);
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [disconnect, gameCode]);

  const RenderPage = () => {
    switch (contentType) {
      case ContentType.NOT_STARTED:
        return (
          <div className="player" key={username}>
            <div className="relative">
              <ImageForm
                imageUrl={imageUrl}
                onImageChange={(newImageUrl: string) => {
                  console.log(newImageUrl);
                  setImageUrl(newImageUrl);
                  stompClient?.send(
                    `/app/chat/${gameCode}/updateUser`,
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
        );
      default:
        return content;
    }
  };

  return (
    <div className="lobby-container flex w-full h-full items-center justify-center z-50">
      {RenderPage()}
    </div>
  );
};
export default ChatRoom;

export function QuestionOptions({
  submitAnswer,
  slide,
}: {
  submitAnswer: (ind: number) => void;
  slide: Slide;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {slide.answers.map((answer, ind) => (
          <div
            key={ind}
            onClick={() => {
              submitAnswer(ind);
            }}
          >
            <OptionBar
              ind={ind}
              key={ind}
              questionType={slide.questionType}
              answer={answer}
              shape={
                SHAPES[slide.questionType === "QUIZ" ? ind : (ind + 1) % 2]
              }
              color={
                COLORS[slide.questionType === "QUIZ" ? ind : (ind + 1) % 2]
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
