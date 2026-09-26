import React from 'react'
import Profile from './Profile'
import PostGrid from './PostGrid'

export default function InstagramLayout(){
  return (
    <div className="ig-app">
      <aside className="ig-sidebar">
        <div className="ig-logo">Instagram</div>
        <nav className="ig-nav">
          <a>Home</a>
          <a>Search</a>
          <a>Explore</a>
          <a>Reels</a>
          <a>Messages</a>
        </nav>
      </aside>

      <main className="ig-main">
        <div className="ig-topbar">
          <div className="ig-top-left">Instagram</div>
          <div className="ig-top-right">🔍 ⬜ ❤️ <span className="tiny-avatar"/></div>
        </div>

        <div className="ig-content">
          <Profile />
          <div className="ig-tabs">
            <button className="tab active">POSTS</button>
            <button className="tab">REELS</button>
            <button className="tab">TAGGED</button>
          </div>
          <PostGrid />
        </div>
      </main>
    </div>
  )
}
