import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMicrophone, FaPaperPlane, FaRobot, FaUser, FaVolumeUp, FaSpinner } from "react-icons/fa";

const Chat = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string; nodes?: { text: string }[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [voices, setVoices] = useState<{ voice_id: string; name: string }[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    connectWebSocket();
    fetchVoices();
    return () => {
      wsRef.current?.close();
    };
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch("http://localhost:5001/voices");
      if (!response.ok) throw new Error("Failed to fetch voices");
      const data = await response.json();
      setVoices(data);
      if (data.length > 0) setSelectedVoice(data[0].voice_id);
    } catch (error) {
      console.error("Error fetching voices:", error);
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket("ws://localhost:5001");
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected to Whisper backend");
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setTimeout(connectWebSocket, 5000);
    };
    ws.onclose = () => setTimeout(connectWebSocket, 5000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ audioChunk: reader.result?.split(",")[1] }));
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop recording automatically after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 10000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputText = question.trim();
    if (!inputText) return;

    setMessages((prev) => [...prev, { sender: "user", text: inputText }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/query/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: inputText }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const aiResponse = data.response || "";

      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse, nodes: data.nodes || [] }]);
      generateAIResponseAudio(aiResponse);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponseAudio = async (text: string) => {
    try {
      const response = await fetch("http://localhost:5001/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AI voice API error: ${JSON.stringify(errorData)}`);
      }

      const { audioUrl } = await response.json();
      setAudioUrl(`http://localhost:5001${audioUrl}?t=${Date.now()}`);
    } catch (error) {
      console.error("Error generating AI voice:", error);
    }
  };

  return (
    <div className="chat-container bg-white shadow-lg rounded-xl p-6 border border-gray-200 w-full max-w-3xl relative">
      {/* Chat Messages */}
      <div className="chat-messages overflow-y-auto max-h-96 p-4 space-y-3">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`message ${msg.sender === "user" ? "user-message" : "ai-message"} flex flex-col gap-2 p-3 rounded-lg max-w-3/4`}
          >
            {msg.sender === "user" ? <FaUser className="text-blue-600" /> : <FaRobot className="text-green-600" />}
            <p>{msg.text}</p>
            {msg.sender === "ai" && audioUrl && (
              <button onClick={() => new Audio(audioUrl).play()} className="text-gray-500 hover:text-gray-700">
                <FaVolumeUp /> Listen
              </button>
            )}
          </motion.div>
        ))}
        {loading && (
          <motion.div className="flex items-center gap-2">
            <FaSpinner className="animate-spin text-gray-500" />
            <p className="text-gray-500">Generating Answer</p>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="chat-input flex gap-3 mt-4">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-3 rounded-full transition ${isRecording ? "bg-red-500 text-white" : "bg-gray-300 hover:bg-gray-400"}`}
        >
          <FaMicrophone className="text-gray-700" />
        </button>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type or speak your question..."
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" disabled={loading}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default Chat;
