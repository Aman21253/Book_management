import "../styles/page.css";
import "../styles/chat.css";

export default function ChatHistory() {
  return (
    <div className="page">
      <div className="chat">
        <div className="message user">What is this book about?</div>
        <div className="message ai">
          This book focuses on habit building and self improvement.
        </div>
      </div>
    </div>
  );
}