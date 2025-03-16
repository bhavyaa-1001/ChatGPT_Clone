import React from 'react';
import '../styles/UserProfile.css';

function UserProfile() {
  return (
    <div className="user-profile">
      <div className="user-avatar">
        <span>BB</span>
      </div>
      <div className="user-info">
        <h3>Bhavya Bansal</h3>
        <p>Developer</p>
      </div>
    </div>
  );
}

export default UserProfile; 