import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [receivedMessage, setReceivedMessage] = useState('');
  // console.log(messages)
  const wsRef = useRef(null);
  const userIdRef = useRef(
    Math.floor(Math.random() * 1_000_000).toString()
  );

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to server");
      setConnected(true);

      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: {
            name: "John Doe",
            userId: userIdRef.current,
            roomId: "1",
          },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type == "ADD_CHAT") {
          setMessages((prev) => [
            ...prev,
            {
              text: data.payload.message,
              upvotes: data.payload.upvotes,
              id: data.payload.chatId
            },
          ]);
        }

        if(data.type == "UPDATE_CHAT"){
          setMessages(prev => {
            return prev.map(msg => {
              if(msg.id === data.payload.chatId){
                return {...msg, upvotes: data.payload.upvotes}
              }
              return msg;
            })
          })
        }

        if (data.error) {
          console.error("Server error:", data.error);
        }
      } catch (e) {
        console.error("Invalid JSON:", event.data);
      }
    };

    ws.onerror = () => {
      console.error("WebSocket connection error");
    };

    ws.onclose = () => {
      console.log("Disconnected from server");
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  function sendChat() {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("Socket not ready");
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "SEND_MESSAGE",
        payload: {
          message,
          userId: userIdRef.current,
          roomId: "1",
        },
      })
    );

    setMessage("");
  }

  function UpvoteMessage(userId, roomId, chatId) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("Socket not ready");
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: "UPVOTE_MESSAGE",
        payload: {
          userId: userId,
          roomId: roomId,
          chatId: chatId
        },
      })
    );
  }

  return (
    <>


      <h1>REAL TIME CHAT APP</h1>
      <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <div className="chat-box">
        {messages.length === 0 && (
          <p className="empty">No messages yet</p>
        )}

        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <span>{msg.text}</span>
            <button onClick={() => UpvoteMessage(userIdRef.current, "1", msg.id)}>⬆ {msg.upvotes}</button>
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendChat} disabled={!connected}>
        Send Message
      </button>
    </>
  );
}

export default App;
