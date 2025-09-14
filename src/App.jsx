import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";   // ✅ Markdown support
import "./App.css";

// 🔑 Replace with your Gemini API key (better: store in .env)
const API_KEY = "AIzaSyA6CUbNCik0zXaNCeVBhzcPoQ61gut8eHY";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome, I am **SAATHI-AI**. How are you feeling today?",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState("calm");

  const chatEndRef = useRef(null);

  function getTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      setTimeout(() => {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, loading]);

  // Load journal from localStorage
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem("journal")) || [];
    setJournalEntries(savedEntries);
  }, []);

  // Save journal to localStorage
  useEffect(() => {
    localStorage.setItem("journal", JSON.stringify(journalEntries));
  }, [journalEntries]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input, time: getTime() };
    setMessages((prev) => [...prev, newMessage]);

    setLoading(true);
    try {
      const result = await model.generateContent(
        `Respond in a ${mood} and supportive tone. 
         Always highlight important parts using **bold text**.
         User says: ${input}`
      );

      const botText =
        result.response.text() ||
        result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ Sorry, I couldn’t generate a reply.";

      const botReply = {
        sender: "bot",
        text: botText, // 👉 If you want *full bold*: `text: \`**${botText}**\``
        time: getTime(),
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Sorry, something went wrong.",
          time: getTime(),
        },
      ]);
    }
    setLoading(false);
    setInput("");
  };

  const handleJournalSave = () => {
    if (!input.trim()) return;
    const newEntry = { text: input, time: getTime() };
    setJournalEntries((prev) => [...prev, newEntry]);
    setInput("");
  };

  return (
    <div className={`app-container mood-${mood}`}>
      {/* Header */}
      <div className="header">
        <div className="logo">🧠 SAATHI </div>
        <div className="tabs">
          <button
            className={`tab ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <b>Chat</b>💬
          </button>
          <button
            className={`tab ${activeTab === "journal" ? "active" : ""}`}
            onClick={() => setActiveTab("journal")}
          >
            <b>Journal</b>📖
          </button>
          <button
            className={`tab ${activeTab === "toolkit" ? "active" : ""}`}
            onClick={() => setActiveTab("toolkit")}
          >
          <b>Toolkit</b>🛠️
          </button>
        </div>
      </div>

      {/* Mood Selector */}
      <div className="mood-selector">
        <label><b>🌈 Set Your Mood:</b></label>
        <select value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="calm"><b>Calm</b></option>
          <option value="happy"><b>Happy</b></option>
          <option value="motivated"><b>Motivated</b></option>
          <option value="reflective"><b>Reflective</b></option>
        </select>

        <div className="quick-moods">
          <button onClick={() => setMood("calm")}>😌</button>
          <button onClick={() => setMood("happy")}>😃</button>
          <button onClick={() => setMood("motivated")}>💪</button>
          <button onClick={() => setMood("reflective")}>🤔</button>
        </div>
      </div>

      {/* Main content */}
      {activeTab === "chat" && (
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
              <div className="timestamp">{msg.time}</div>
            </div>
          ))}
          {loading && <div className="message bot">⏳ Thinking...</div>}
          <div ref={chatEndRef} />
        </div>
      )}

      {activeTab === "journal" && (
        <div className="chat-box">
          {journalEntries.length === 0 ? (
            <div className="message bot">
              No journal entries yet. Start writing your thoughts! ✍️
            </div>
          ) : (
            journalEntries.map((entry, index) => (
              <div key={index} className="message user">
                <ReactMarkdown>{entry.text}</ReactMarkdown>
                <div className="timestamp">{entry.time}</div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "toolkit" && (
        <div className="chat-box">
          <div className="message bot">🛠️ Quick Wellness Toolkit</div>
          <div className="message bot">✨ Try 5 deep breaths</div>
          <div className="message bot">
            📝 Write down one thing you’re grateful for
          </div>
          <div className="message bot">🎶 Listen to your favorite song</div>
        </div>
      )}

      {/* Input Area */}
      <div className="input-area">
        <input
          type="text"
          placeholder={
            activeTab === "journal"
              ? "Write your thoughts here…"
              : "Tell me what’s on your mind…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            (activeTab === "chat" ? handleSend() : handleJournalSave())
          }
        />
        <button
          onClick={activeTab === "chat" ? handleSend : handleJournalSave}
        >
          {activeTab === "chat" ? "Send" : "Save"}
        </button>
      </div>

      {/* Footer */}
      <div className="footer">
        ⚠️ <b>SAATHI AI</b> is for wellness support. It is <b>not</b> medical advice.
        If you are in crisis, please reach out to a qualified professional or
        local helpline.
      </div>
    </div>
  );
}

export default App;
