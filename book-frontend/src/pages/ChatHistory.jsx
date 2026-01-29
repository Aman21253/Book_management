import "../styles/page.css";
import "../styles/chat.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

export default function ChatHistory() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  //Start closed (first screen has only left panel)
  const [showChat, setShowChat] = useState(false);

  const [messages, setMessages] = useState([]); // {role:'user'|'ai', text:''}
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await API.get(`books/${id}/`);
        setBook(res.data);
      } catch (e) {
        console.error("Failed to load book", e);
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const firstPrompt = useMemo(() => {
    if (!book) return "";
    return `Write me a description in about 5-10 lines for the book name '${book.title}' & book author name '${book.author}'.`;
  }, [book]);

  const sendToAI = async (text) => {
    setSending(true);
    try {
      const res = await API.post(`books/${id}/chat/`, { message: text });
      const reply = res.data?.reply || "No reply received.";
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch (err) {
      console.error("Chat error:", err.response?.data || err.message);
      const msg = err.response?.data?.error || "AI service error. Please try again.";
      setMessages((prev) => [...prev, { role: "ai", text: msg }]);
    } finally {
      setSending(false);
    }
  };

  const handleStart = async () => {
    if (!book) return;

    // show the AI chat card
    setShowChat(true);

    // reset conversation
    setMessages([]);

    // auto first message
    setMessages([{ role: "user", text: firstPrompt }]);

    // focus input
    setTimeout(() => inputRef.current?.focus(), 150);

    // call AI
    await sendToAI(firstPrompt);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    await sendToAI(text);
  };

  const onEnterSend = (e) => {
    if (e.key === "Enter") handleSend();
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!book) return <p style={{ padding: 40 }}>Book not found</p>;

  return (
    <div className="page">
      <div className="page-content">
        <div className={`chat-page ${showChat ? "two-col" : "one-col"}`}>
          <div className="chat-left card">
            <div className="chat-left-header">
              <h2 className="chat-title">Chat History &gt; {book.title}</h2>

              <button className="btn-primary" onClick={handleStart} disabled={sending}>
                {sending ? "Starting..." : "Start AI Chat"}
              </button>
            </div>

            <div className="chat-history">
              {!showChat && (
                <div className="chat-about">
                  <p className="about-text">
                    {book.about || "No description available."}
                  </p>
                </div>
              )}

              {showChat && (
                <>
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`chat-bubble ${m.role === "user" ? "user" : "ai"}`}
                    >
                      {m.text}
                    </div>
                  ))}

                  {sending && <div className="chat-bubble ai">Typing...</div>}
                  <div ref={bottomRef} />
                </>
              )}
            </div>
          </div>

          {showChat && (
          <div className="ai-panel card">
            <div className="ai-panel-header">
              <h3>✨ AI Chat</h3>
            </div>
                  
            <div className="ai-panel-body">
            </div>
                  
            <div className="ai-panel-footer">
              <input
                ref={inputRef}
                className="ai-panel-input"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onEnterSend}
                disabled={sending}
              />
        
              <button
                className="ai-panel-send"
                onClick={handleSend}
                disabled={sending || !input.trim()}
              >
                Send
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}