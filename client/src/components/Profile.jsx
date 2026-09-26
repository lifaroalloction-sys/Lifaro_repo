import React from 'react'

export default function Profile(){
  const avatarUrl = 'https://drive.google.com/thumbnail?id=1MFcGN82jgIT2sltigoxI7Zpj3ixCEZck&sz=w800'

  return (
    <section className="profile">
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
  )
}
