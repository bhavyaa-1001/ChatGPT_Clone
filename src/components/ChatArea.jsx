import React, { useState, useRef, useEffect } from 'react';
import '../styles/ChatArea.css';
import Logo from './Logo';

function ChatArea({ messages, onSendMessage, isLoading, searchMode }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleFeatureClick = (query) => {
    setInput(query);
    inputRef.current?.focus();
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    const messageContent = message.content;

    return (
      <div key={index} className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
        <div className="message-content">
          {isUser ? (
            <p>{messageContent}</p>
          ) : message.isSearchResult ? (
            <div className="search-results">
              {messageContent.split('\n\n').map((result, i) => (
                <div key={i} className="search-result">
                  {result.split('\n').map((line, j) => {
                    if (line.startsWith('📌')) {
                      return <h3 key={j}>{line.slice(2)}</h3>;
                    } else if (line.startsWith('🔗')) {
                      return <a key={j} href={line.slice(2)} target="_blank" rel="noopener noreferrer">{line.slice(2)}</a>;
                    } else if (line.startsWith('🖼️')) {
                      return <img key={j} src={line.slice(3)} alt="Search result" className="search-image" />;
                    } else {
                      return <p key={j}>{line}</p>;
                    }
                  })}
                </div>
              ))}
            </div>
          ) : (
            <p>{messageContent}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-area">
      <div className="messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <div className="logo-container">
              <Logo />
            </div>
            <h1>Welcome to ChatGPT 2.0</h1>
            <p>How can I help you today?</p>
            <div className="feature-buttons">
              <button onClick={() => handleFeatureClick("What are the latest AI developments?")}>
                Latest AI News
              </button>
              <button onClick={() => handleFeatureClick("/search best programming languages 2024")}>
                Programming Trends
              </button>
              <button onClick={() => handleFeatureClick("Tell me about machine learning applications")}>
                ML Applications
              </button>
              <button onClick={() => handleFeatureClick("/search top tech companies")}>
                Tech Companies
              </button>
            </div>
            <div className="search-tips">
              <h3>Search Tips:</h3>
              <ul>
                <li>Type normally for conversational search</li>
                <li>Use "/search" for direct search results</li>
                <li>Click on any feature button to try an example query</li>
                <li>Your chat history is automatically saved</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((message, index) => renderMessage(message, index))
        )}
        {isLoading && (
          <div className="message assistant">
            <div className="loading-indicator">Searching...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={searchMode ? "Type your search query..." : "Type your message..."}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatArea; 