import React from 'react'

export default function Profile(){
  return (
    <section className="profile">
      <aside className="profile-left">
        <div className="avatar" />
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
