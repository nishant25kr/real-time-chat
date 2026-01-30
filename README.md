# RankedChat 💬

A modern, real-time WebSocket chat application with live upvoting and dynamic message ranking. Built with React and Node.js.

## 🌟 Overview

RankedChat enables users to engage in real-time conversations where messages are dynamically ranked based on community upvotes. The application provides three simultaneous views of the conversation, updating instantly without page reloads.

### Key Highlights

- **Real-time Communication** - Instant message delivery using WebSockets
- **Live Voting System** - Upvote messages to influence their ranking
- **Dynamic UI Updates** - Three synchronized views (All Messages, Top 5, Top 2)
- **Connection Monitoring** - Visual status indicator for WebSocket connection
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

---

## 🚀 Features

### Core Functionality
- ⚡ Real-time messaging with WebSocket protocol
- 👍 Live upvoting and downvoting system
- 📊 Automatic message sorting by vote count
- 🔄 Instant UI synchronization across all views
- 🎯 Room-based chat organization
- 🟢 Connection status monitoring

### User Interface
- 📱 Fully responsive layout (mobile-first design)
- 🎨 Clean, professional UI with Tailwind CSS
- 📈 Multiple ranking views:
  - **All Messages** - Complete conversation history
  - **Top 5 Messages** - Highest voted messages
  - **Top 2 Messages** - Best two messages
- ⌨️ Form submission with Enter key support
- 🎭 Smooth hover effects and transitions

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18+** | UI framework with hooks |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **WebSocket API** | Real-time client communication |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express** | Web server framework |
| **ws** | WebSocket library |

---

## 📐 Architecture

### System Design

```
┌─────────────┐         WebSocket         ┌─────────────┐
│   Client 1  │◄──────────────────────────►│             │
└─────────────┘                            │             │
                                           │   Server    │
┌─────────────┐         WebSocket         │  (Node.js)  │
│   Client 2  │◄──────────────────────────►│             │
└─────────────┘                            │             │
                                           └─────────────┘
       ▲                                          │
       │                                          │
       └──────────── Broadcasts Updates ─────────┘
```

### Data Flow

1. **Client connects** to WebSocket server
2. **User sends message** via input form
3. **Server receives** and broadcasts to all clients
4. **Clients update** local state and re-render
5. **User upvotes** trigger UPDATE_CHAT events
6. **UI automatically** sorts and displays rankings

### State Management

- Single source of truth (`messages` array)
- Derived views computed on render
- Sorted by upvote count for rankings
- Immutable state updates for React optimization

---

## 📡 WebSocket API

### Client → Server Events

#### JOIN_ROOM
Join a chat room on connection.

```json
{
  "type": "JOIN_ROOM",
  "payload": {
    "name": "John Doe",
    "userId": "123456",
    "roomId": "1"
  }
}
```

#### SEND_MESSAGE
Send a new chat message.

```json
{
  "type": "SEND_MESSAGE",
  "payload": {
    "message": "Hello, world!",
    "userId": "123456",
    "roomId": "1"
  }
}
```

#### UPVOTE_MESSAGE
Upvote an existing message.

```json
{
  "type": "UPVOTE_MESSAGE",
  "payload": {
    "chatId": "msg_abc123",
    "userId": "123456",
    "roomId": "1"
  }
}
```

### Server → Client Events

#### ADD_CHAT
Broadcast when a new message is added.

```json
{
  "type": "ADD_CHAT",
  "payload": {
    "chatId": "msg_abc123",
    "message": "Hello, world!",
    "upvotes": 0
  }
}
```

#### UPDATE_CHAT
Broadcast when a message is upvoted.

```json
{
  "type": "UPDATE_CHAT",
  "payload": {
    "chatId": "msg_abc123",
    "upvotes": 5
  }
}
```



⭐ Star this repository if you found it helpful!

