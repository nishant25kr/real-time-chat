import { useEffect, useRef, useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const userIdRef = useRef(
    Math.floor(Math.random() * 1_000_000).toString()
  );

  useEffect(() => {
    const ws = new WebSocket(`${import.meta.env.VITE_SERVER_URL}`);
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
        if (data.type === "ADD_CHAT") {
          setMessages((prev) => {
            const updated = [
              ...prev,
              {
                text: data.payload.message,
                upvotes: data.payload.upvotes,
                id: data.payload.chatId,
              },
            ];
            return updated.sort((a, b) => a.upvotes - b.upvotes);
          });
        }

        if (data.type === "UPDATE_CHAT") {
          setMessages((prev) => {
            const updated = prev.map((msg) =>
              msg.id === data.payload.chatId
                ? { ...msg, upvotes: data.payload.upvotes }
                : msg
            );
            return updated.sort((a, b) => a.upvotes - b.upvotes);
          });
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

  function sendChat(e) {
    e.preventDefault();
    if (!message.trim()) return;
    
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
          chatId: chatId,
        },
      })
    );
  }

  const MessageCard = ({ msg, showUpvotes = true }) => (
    <div className="bg-white border border-gray-200 p-3 md:p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-2 md:gap-4">
        <p className="text-gray-800 text-xs md:text-sm flex-1 break-words">
          {msg.text}
        </p>
        {showUpvotes && (
          <button
            onClick={() => UpvoteMessage(userIdRef.current, "1", msg.id)}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 hover:border-gray-400 transition-colors flex-shrink-0"
          >
            <span className="text-gray-100 text-xs">▲</span>
            <span className="text-gray-100 text-xs font-medium">
              {msg.upvotes}
            </span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 min-w-screen sm:p-4 md:p-6 flex items-center justify-center">
      <div className="w-full max-w-full lg:max-w-[1800px] h-screen sm:h-[95vh] bg-white border border-gray-300 flex flex-col">
        
        {/* Header */}
        <div className="bg-gray-100 px-3 sm:px-4 md:px-6 py-3 md:py-4 border-b border-gray-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 md:gap-4">
              <h1 className="text-sm md:text-xl font-semibold text-gray-900 uppercase tracking-wide">
                Real-Time Chat
              </h1>
              <div className="h-3 md:h-4 w-px bg-gray-400"></div>
              <span className="text-xs md:text-sm text-gray-600">
                Room #1
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Status
              </span>
              <div className={`w-2 h-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-xs md:text-sm font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
                {connected ? "CONNECTED" : "DISCONNECTED"}
              </span>
            </div>
          </div>
        </div>

        {/* Three Column Layout - Responsive */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-300 overflow-hidden">
          
          {/* Column 1: All Messages */}
          <div className="bg-white flex flex-col">
            <div className="bg-gray-50 px-3 md:px-4 py-2 md:py-3 border-b border-gray-300">
              <h2 className="text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider">
                All Messages
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 md:p-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">
                    No messages yet
                  </p>
                </div>
              )}
              <div className="space-y-2 md:space-y-3">
                {messages.map((msg) => (
                  <MessageCard key={msg.id} msg={msg} />
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Top 5 Messages */}
          <div className="bg-white flex flex-col">
            <div className="bg-gray-50 px-3 md:px-4 py-2 md:py-3 border-b border-gray-300">
              <h2 className="text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Top 5 Messages
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 md:p-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">
                    No messages yet
                  </p>
                </div>
              )}
              <div className="space-y-2 md:space-y-3">
                {messages
                  .sort((a, b) => b.upvotes - a.upvotes)
                  .slice(0, 5)
                  .map((msg) => (
                    <MessageCard key={msg.id} msg={msg} />
                  ))}
              </div>
            </div>
          </div>

          {/* Column 3: Top 2 Messages */}
          <div className="bg-white flex flex-col md:col-span-2 lg:col-span-1">
            <div className="bg-gray-50 px-3 md:px-4 py-2 md:py-3 border-b border-gray-300">
              <h2 className="text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Top 2 Messages
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 md:p-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">
                    No messages yet
                  </p>
                </div>
              )}
              <div className="space-y-2 md:space-y-3">
                {messages
                  .sort((a, b) => b.upvotes - a.upvotes)
                  .slice(0, 2)
                  .map((msg) => (
                    <MessageCard key={msg.id} msg={msg} />
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-100 px-3 sm:px-4 md:px-6 py-3 md:py-4 border-t border-gray-300">
          <form onSubmit={sendChat} className="flex gap-2 md:gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
              disabled={!connected}
              className="flex-1 bg-white text-gray-800 placeholder-gray-400 px-3 md:px-4 py-2 md:py-3 border border-gray-300 focus:outline-none focus:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
            />
            <button
              type="submit"
              disabled={!connected || !message.trim()}
              className="px-4 md:px-8 py-2 md:py-3 bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white disabled:text-gray-500 font-medium uppercase tracking-wider text-xs md:text-sm transition-colors disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;