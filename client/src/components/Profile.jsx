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
              <h2 className="username">Vinoth kumar exploration</h2>
            </div>
            <div className="meta">
              <div><strong>2,458</strong> followers</div>
            </div>
            <div className="bio">
              <p>Travel | Good feels | Memories</p>
            </div>
        </div>
      </section>

      {open && (
        <div className="profile-modal" onClick={() => setOpen(false)}>
          <div className="profile-modal-inner" onClick={(e) => e.stopPropagation()}>
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
