import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = import.meta.env.VITE_SEARCH_ENGINE_ID;

function App() {
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem('chats');
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  // Test API connection on mount
  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=test`
        );
        const data = await response.json();
        console.log("API Test Response:", data);
      } catch (error) {
        console.error("API Test Error:", error);
      }
    };
    testAPI();
  }, []);

  const handleNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      messages: []
    };
    setChats([...chats, newChat]);
    setActiveChat(newChat);
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  const handleClearHistory = () => {
    setChats([]);
    setActiveChat(null);
    localStorage.removeItem('chats');
  };

  const handleDeleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    if (activeChat?.id === chatId) {
      setActiveChat(null);
    }
  };

  const formatSearchResults = (items) => {
    return items.map(item => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      image: item.pagemap?.cse_image?.[0]?.src
    }));
  };

  const handleSendMessage = async (message) => {
    if (!activeChat) {
      handleNewChat();
    }

    const updatedChat = {
      ...activeChat,
      messages: [
        ...activeChat.messages,
        { role: 'user', content: message }
      ]
    };

    setChats(chats.map(chat => 
      chat.id === updatedChat.id ? updatedChat : chat
    ));
    setActiveChat(updatedChat);
    setIsLoading(true);

    try {
      const isSearchCommand = message.toLowerCase().startsWith('/search');
      const searchQuery = isSearchCommand ? message.slice(7).trim() : message;
      setSearchMode(isSearchCommand);

      const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}`;
      console.log('Making request to:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`Failed to fetch search results: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('Search Results:', data);
      
      let content = '';
      if (data.items && data.items.length > 0) {
        const formattedResults = formatSearchResults(data.items);
        
        if (isSearchCommand) {
          content = formattedResults.map(result => 
            `📌 ${result.title}\n${result.snippet}\n🔗 ${result.link}${result.image ? '\n🖼️ ' + result.image : ''}`
          ).join('\n\n');
        } else {
          content = `Here's what I found:\n\n${
            formattedResults.slice(0, 3).map((result, index) => 
              `${index + 1}. ${result.title}\n${result.snippet}\n${result.link}`
            ).join('\n\n')
          }\n\nWould you like me to search for anything specific about this topic?`;
        }
      } else {
        content = 'I couldn\'t find any results for that query. Could you try rephrasing it?';
      }

      const botResponse = {
        role: 'assistant',
        content,
        isSearchResult: isSearchCommand
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, botResponse],
        title: updatedChat.messages.length === 1 ? searchQuery.slice(0, 30) + '...' : updatedChat.title
      };

      setChats(chats.map(chat => 
        chat.id === finalChat.id ? finalChat : chat
      ));
      setActiveChat(finalChat);
    } catch (error) {
      console.error('Error details:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message || 'An unexpected error occurred. Please try again.'}`,
        isError: true
      };
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, errorMessage]
      };
      setChats(chats.map(chat => 
        chat.id === finalChat.id ? finalChat : chat
      ));
      setActiveChat(finalChat);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar
        onNewChat={handleNewChat}
        chats={chats}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onClearHistory={handleClearHistory}
        onDeleteChat={handleDeleteChat}
      />
      <ChatArea
        messages={activeChat?.messages || []}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        searchMode={searchMode}
      />
    </div>
  );
}

export default App; 