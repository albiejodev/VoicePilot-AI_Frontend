# 🎨 VoicePilot AI Frontend

<p align="center">

**Modern React Voice Interface for VoicePilot AI**

Real-time voice conversations • Live transcripts • AI responses • Appointment booking

</p>

---

# 🚀 Overview

The VoicePilot AI Frontend is a React application that demonstrates the complete real-time AI receptionist workflow.

It captures microphone audio, streams it to the backend over WebSockets, displays live transcripts, renders the conversation history, plays AI-generated speech, and displays appointment confirmations.

The frontend is intentionally lightweight and focuses on showcasing the AI workflow.

While the current demo uses a browser microphone, the backend architecture supports replacing the browser with **Twilio Media Streams** to enable real phone calls.

---

# 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React |
| Language | TypeScript |
| Build Tool | Vite |
| Communication | WebSocket |
| Audio Recording | MediaRecorder API |
| Styling | React Inline Styles |
| Voice Streaming | WebSocket |

---

# ✨ Features

- ✅ Browser microphone recording
- ✅ Real-time audio streaming
- ✅ Live transcript
- ✅ AI conversation history
- ✅ Voice playback
- ✅ Assistant status indicator
- ✅ Appointment confirmation card
- ✅ Responsive dashboard layout
- ✅ WebSocket communication

---

# 🖥 UI Preview

---

## Home Screen

> *(Add Screenshot)*

---

## Live Conversation

> *(Add Screenshot)*

---

## AI Thinking

> *(Add Screenshot)*

---

## Appointment Booked

> *(Add Screenshot)*

---

## Google Calendar Confirmation

> *(Add Screenshot)*

---

# 🎥 Demo GIF

> *(Add GIF here)*

---

# 🏗 Frontend Architecture

```text
                 React Application

                       │

          Voice Recorder Component

                       │

          MediaRecorder API

                       │

                Audio Chunks

                       │

                WebSocket Client

                       │

                FastAPI Backend

                       │

      Deepgram → Gemini → Redis

                       │

              ElevenLabs Audio

                       │

             Browser Audio Player
```

---

# 🔄 Frontend Workflow

```text
User clicks Start Recording

            │

            ▼

Browser Microphone

            │

            ▼

MediaRecorder API

            │

Audio Chunks

            │

            ▼

WebSocket

            │

            ▼

FastAPI Backend

            │

Deepgram

            │

Gemini

            │

ElevenLabs

            │

            ▼

Browser Speaker

            │

Conversation Updated
```

---

# 📂 Folder Structure

```text
frontend/

│

├── src/

│   ├── assets/

│   ├── components/

│   │      ├── VoiceRecorder.tsx
│   │      └── ...

│   ├── hooks/

│   │      ├── useMicrophone.ts
│   │      └── ...

│   ├── services/

│   │      ├── websocket.service.ts
│   │      └── ...

│   ├── utils/

│   ├── App.tsx

│   └── main.tsx

│

├── public/

├── package.json

└── README.md
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone <repository-url>

cd frontend
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

---

# 🌐 Backend Connection

The frontend communicates with the backend over WebSockets.

Current endpoint

```text
ws://localhost:8000/ws/{session_id}
```

---

# 🎯 Demo Workflow

1. Start the backend server.
2. Launch the frontend.
3. Click **Start Recording**.
4. Introduce yourself.
5. Ask **"What is my name?"** to demonstrate conversation memory.
6. Book an appointment.
7. View the appointment confirmation card.
8. Verify the event in Google Calendar.
9. Continue the conversation.

---

# 🎨 UI Components

- Voice Recorder
- Live Transcript Card
- Conversation History
- Assistant Status Card
- Appointment Confirmation Card
- Wave Animation
- Connection Indicator

---

# 📞 Why Browser Instead of Phone?

The browser client was intentionally chosen to rapidly prototype and demonstrate the complete AI workflow during development.

The backend was designed to be **transport-agnostic**, meaning the browser can later be replaced with **Twilio Media Streams** without significant backend changes.

Future architecture

```text
Phone

   │

Twilio Media Streams

   │

FastAPI Backend

   │

Current AI Pipeline
```

---

# 💡 Challenges & Learnings

Building the frontend involved solving challenges such as:

- Streaming microphone audio
- Real-time WebSocket communication
- Managing recording states
- Synchronizing AI responses
- Rendering live transcripts
- Audio playback
- Building a conversational dashboard
- Integrating browser media APIs

---

# 🛣 Future Roadmap

- 📞 Twilio Phone Calls
- 📱 Mobile Responsive UI
- 🎨 Improved Animations
- 🌍 Multi-language Interface
- 📊 Conversation Analytics
- 🔐 Authentication
- 📁 Conversation History
- ☁ Production Deployment

---

# 🙏 Acknowledgements

- React
- Vite
- TypeScript
- FastAPI
- Gemini
- Deepgram
- ElevenLabs

---

# 📄 License

MIT License