import React from 'react'
import Profile from './Profile'
import PostGrid from './PostGrid'

export default function InstagramLayout(){
  return (
    <div className="ig-app simple">
      <main className="ig-main simple">
        <div className="ig-content simple">
          <Profile />
          <div className="ig-tabs simple">
            <button className="tab active">POSTS</button>
          </div>
          <PostGrid />
        </div>
      </main>
    </div>
  )
}
