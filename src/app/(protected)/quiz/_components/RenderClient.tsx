"use client";
import { Button } from "@/components/ui/button";
import {
  AdvancedChatMessage,
  ChatMessage,
  Leaderboard,
  MessageType,
  Question,
  Receiver,
} from "@/types";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import ReactCountDown from "./ReactCountDown";
import {
  Slide,
  useSlides,
} from "../../questionset/create/_components/slides.hook";
import { convertSlideToQuestion } from "@/lib/utils";

// RenderClient
// 1. timer -> 3 seconds delay and auto to next question to all clients in quiz
// 2. question show for 5 seconds and auto to answer options for all clients in quiz
// 3. answer options
// 4. frequency of answers for each options -> Next to leaderboard Button
// 5. Leaderboard -> next Question button

type MessageContent = {};

const RenderClient = ({ questions }: { questions: Slide[] }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currQuestion, setCurrQuestion] = useState(-1);
  const [showOptions, setShowOptions] = useState(false);
  const [questionLoader, setQuestionLoader] = useState(false);
  const [showAnswerFrequency, setShowAnswerFrequency] = useState(false);
  const [answerFrequency, setAnswerFrequency] = useState<number[]>([]);
  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [scoreboard, setScoreboard] = useState<Leaderboard[]>([]);
  const slidesState = useSlides();
  useEffect(() => {
    slidesState.setSlides(questions);
  }, [questions, slidesState]);

  const gameCode = searchParams.get("gameCode");

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
        client.subscribe(`/room/${gameCode}/activeUsers`, activeUserEvents);
        client.subscribe(`/room/${gameCode}/quiz`, quizEvents);
        client.subscribe(`/room/${gameCode}`, onConnect);
        client.send(
          `/app/chat/${gameCode}/getUsers`,
          {},
          JSON.stringify({ type: "GET" })
        );
        setStompClient(client);
      },
      (error) => {
        console.error("Error connecting:", error);
      }
    );

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameCode]); // Reconnect if gameCode changes

  const disconnect = () => {
    if (stompClient && connected) {
      stompClient.disconnect(() => {
        toast.success("Disconnected successfully");
        console.log("Disconnected");
        // setConnected(false);
      });
    }
  };

  const onConnect = () => {};

  const renderPage = () => {};

  const activeUserEvents = (message: Stomp.Message) => {};
  const quizEvents = (message: Stomp.Message) => {
    const msg: AdvancedChatMessage = JSON.parse(message.body);
    const reciever = msg.receiver;
    if (reciever === Receiver.PLAYER) {
      return;
    }
    switch (msg.type) {
      case MessageType.QUESTION:
        setQuestionLoader(false);
        setShowOptions(true);
        break;
      case MessageType.START:
        // setLoading(true);
        break;
      case MessageType.NEXT:
        setShowAnswerFrequency(true);
        setAnswerFrequency(msg.answerFrequency || []);
        break;
      case MessageType.LEADERBOARD:
        setShowAnswerFrequency(false);
        setShowOptions(false);
        setShowScoreBoard(true);
        setScoreboard(msg.leaderboard || []);
        break;
      default:
        console.log("Unknown message type", msg);
    }
  };

  const sendCurrentQuestionToServer = () => {
    // QUESTION after 5 seconds
    // receives response from server after 5 seconds
    const currentQuestion: Partial<AdvancedChatMessage> = {
      type: MessageType.QUESTION,
      question: convertSlideToQuestion(slidesState.currentSlide),
      receiver: Receiver.PLAYER,
      delayInSeconds: 5,
    };
    stompClient?.send(
      `/app/chat/${gameCode}/question`,
      {},
      JSON.stringify(currentQuestion)
    );
  };

  const renderQuestionClientOnly = (qno: number) => {
    if (qno > slidesState.slides.length) {
      stompClient?.send(
        `/app/chat/${gameCode}/end`,
        {},
        JSON.stringify({ type: MessageType.END })
      );
      return;
    }
    setCurrQuestion(qno);
    slidesState.setCurrentSlide(qno);
    sendCurrentQuestionToServer();
    setQuestionLoader(true);
  };

  const renderLeaderboard = () => {

    const msg: Partial<AdvancedChatMessage> = {
      type: MessageType.LEADERBOARD,
      receiver: Receiver.HOST,
    };
    // LEADERBOARD
    stompClient?.send(
      `/app/chat/${gameCode}/leaderboard`,
      {},
      JSON.stringify(msg)
    );
  };

  if (loading) {
    return (
      <ReactCountDown
        className="fixed inset-0 z-50"
        setLoading={(val: boolean) => {
          setLoading(false);
          renderQuestionClientOnly(currQuestion + 1);
        }}
      />
    );
  }

  // LEADERBOARD
  if (showScoreBoard) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col gap-3">
          <h1>Leaderboard</h1>
          <div className="flex flex-col gap-3">
            {scoreboard.map((player) => (
              <div key={player.username} className="flex justify-between">
                <h1>{player.username}</h1>
                <h1>{player.score}</h1>
              </div>
            ))}
          </div>
          <Button
            onClick={() => {
              setShowScoreBoard(false);
              renderQuestionClientOnly(currQuestion + 1);
            }}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  if (showAnswerFrequency) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col gap-3">
          <h1>Leaderboard</h1>
          <div className="flex flex-col gap-3">
            {Object.entries(answerFrequency).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <h1>Option {key}</h1>
                <h1>{value}</h1>
              </div>
            ))}
          </div>
          <Button onClick={renderLeaderboard}>Next</Button>
        </div>
      </div>
    );
  }

  // QUESTION with options
  if (showOptions) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <h1>Question {currQuestion + 1}</h1>
            {/* <h1>Time Left: s</h1> */}
          </div>
          {/* <ProgressBar time={slidesState.currentSlide.timeLimit} /> */}
          <h1>{slidesState.currentSlide.question}</h1>
          <div className="flex flex-col gap-3">
            {slidesState.currentSlide.answers.map((option, index) => (
              <Button key={index}>{option.answer}</Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (questionLoader) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col gap-3">
          <h1>Question {currQuestion + 1}</h1>
          <h1>{slidesState.currentSlide.question}</h1>
          {/* <ProgressBar time={5} /> */}
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col gap-3">
          <h1>Waiting for the host to start the quiz</h1>
          <Button
            onClick={() => {
              stompClient?.send(
                `/app/chat/${gameCode}/start`,
                {},
                JSON.stringify({ type: MessageType.START })
              );
              setIsStarted(true);
            }}
          >
            Start
          </Button>
        </div>
      </div>
    );
  }

  return <div></div>;
};

export default RenderClient;
