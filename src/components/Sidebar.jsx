import React, { useState } from 'react';
import '../styles/Sidebar.css';
import UserProfile from './UserProfile';

function Sidebar({ onNewChat, chats, activeChat, onSelectChat, onClearHistory, onDeleteChat }) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, chatId: null });

  const categories = [
    { id: 'all', name: 'All Chats', icon: '📑' },
    { id: 'work', name: 'Work', icon: '💼' },
    { id: 'personal', name: 'Personal', icon: '👤' },
    { id: 'study', name: 'Study', icon: '📚' },
    { id: 'creative', name: 'Creative', icon: '🎨' },
  ];

  const handleFeatureClick = () => {
    const newChat = {
      id: Date.now(),
      title: 'Chat Mode',
      messages: [{ role: 'user', content: 'Let\'s have a conversation about any topic.' }]
    };
    onNewChat();
    onSelectChat(newChat);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleContextMenu = (e, chatId) => {
    e.preventDefault();
    
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let x = e.pageX;
    let y = e.pageY;
    
    const menuWidth = 200;  
    const menuHeight = 250; 
    
    if (x + menuWidth > windowWidth) {
      x = windowWidth - menuWidth - 10; 
    }
    
    if (y + menuHeight > windowHeight) {
      y = windowHeight - menuHeight - 10; 
    }
    
    setContextMenu({
      visible: true,
      x,
      y,
      chatId
    });
  };

  const handleClickOutside = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleDeleteChat = (chatId) => {
    onDeleteChat(chatId);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const groupChatsByDate = (chats) => {
    const grouped = {};
    chats.forEach(chat => {
      const date = formatDate(chat.id); 
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(chat);
    });
    return grouped;
  };

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || chat.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const groupedChats = groupChatsByDate(filteredChats);

  const handleNewCategoryChat = (categoryId) => {
    onNewChat();  // First create a new chat
    
    // Then update its properties if needed
    const lastChat = chats[chats.length - 1];
    if (lastChat) {
      lastChat.category = categoryId;
      lastChat.title = `New ${categories.find(c => c.id === categoryId).name} Chat`;
      onSelectChat(lastChat);
    }
    
    setActiveCategory(categoryId);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`} onClick={handleClickOutside}>
      {isOpen && (
        <>
          <div className="sidebar-header">
            <div className="header-top">
              <button 
                className="sidebar-toggle" 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSidebar();
                }}
                title={isOpen ? "Close sidebar" : "Open sidebar"}
              >
                <span className="hamburger">≡</span>
              </button>
              <button 
                className="new-chat-btn" 
                onClick={() => {
                  const category = activeCategory !== 'all' ? activeCategory : 'personal';
                  handleNewCategoryChat(category);
                }}
              >
                <span>+</span> New {activeCategory !== 'all' ? categories.find(c => c.id === activeCategory).name : 'Personal'} Chat
              </button>
            </div>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="categories-section">
            <h2>Categories</h2>
            <div className="categories-list">
              {categories.map(category => (
                <div key={category.id} className="category-container">
                  <button
                    className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <span className="category-icon">{category.icon}</span>
                    {category.name}
                    <span className="category-count">
                      {category.id === 'all' 
                        ? chats.length 
                        : chats.filter(chat => chat.category === category.id).length}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`chat-history ${activeCategory !== 'all' ? 'expanded' : ''}`}>
            <div className="history-header">
              <h2>Chat History</h2>
              <button className="clear-history-btn" onClick={onClearHistory}>
                Clear All
              </button>
            </div>
            
            {Object.entries(groupedChats).map(([date, dateChats]) => (
              <div key={date} className="date-group">
                <div className="date-header">{date}</div>
                <ul>
                  {dateChats.map((chat) => (
                    <li
                      key={chat.id}
                      className={chat.id === activeChat?.id ? 'active' : ''}
                      onClick={() => onSelectChat(chat)}
                      onContextMenu={(e) => handleContextMenu(e, chat.id)}
                    >
                      <span className="chat-icon">💭</span>
                      {chat.title || 'New Chat'}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {contextMenu.visible && (
            <div 
              className="context-menu"
              style={{ 
                position: 'fixed',
                top: contextMenu.y,
                left: contextMenu.x
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => handleDeleteChat(contextMenu.chatId)}>
                🗑️ Delete Chat
              </button>
              <div className="context-menu-categories">
                <div className="context-menu-header">Move to Category:</div>
                {categories.filter(cat => cat.id !== 'all').map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      const chat = chats.find(c => c.id === contextMenu.chatId);
                      if (chat) {
                        chat.category = category.id;
                        setContextMenu({ ...contextMenu, visible: false });
                      }
                    }}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-footer">
            <UserProfile />
          </div>
        </>
      )}
      
      {!isOpen && (
        <button 
          className="sidebar-toggle-closed" 
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          title="Open sidebar"
        >
          <span className="hamburger">≡</span>
        </button>
      )}
    </div>
  );
}

export default Sidebar;