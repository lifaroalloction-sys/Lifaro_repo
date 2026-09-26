import React, { useState } from 'react'

export default function Profile(){
  const avatarUrl = 'https://drive.google.com/thumbnail?id=1MFcGN82jgIT2sltigoxI7Zpj3ixCEZck&sz=w800'
  const [open, setOpen] = useState(false)

  return (
    <>
      <section className="profile" onClick={() => setOpen(true)}>
        <aside className="profile-left">
          <img className="avatar" src={avatarUrl} alt="Profile" />
        </aside>
        <div className="profile-main">
          <div className="profile-head">
            <h2 className="username">lifaro</h2>
            <button className="btn primary">Edit Profile</button>
          </div>
          <div className="meta">
            <div><strong>36</strong> posts</div>
            <div><strong>2,458</strong> followers</div>
            <div><strong>312</strong> following</div>
          </div>
          <div className="bio">
            <p>Just a guy with big dreams 🌿<br/>Travel | Photography | Good Vibes</p>
          </div>
        </div>
      </section>

      {open && (
        <div className="profile-modal" onClick={() => setOpen(false)}>
          <div className="profile-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={() => setOpen(false)}>&lt;</button>
            <div className="profile-full">
              <div className="profile-full-avatar">
                <img src={avatarUrl} alt="avatar" />
              </div>
              <h1 className="profile-full-title">VINOTHKUMAR EXPLORATION</h1>
              <div className="profile-full-stats">
                <div className="profile-full-followers"><strong>2,458</strong></div>
              </div>
              <p className="profile-full-desc">Travel | Good feels | Memories</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
