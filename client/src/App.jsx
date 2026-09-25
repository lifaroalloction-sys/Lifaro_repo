import React from 'react'

export default function App(){
  return (
    <div id="root-app">
      <header className="header">
        <div className="logo">JourneyFrames</div>
        <nav className="nav">
          <a>Home</a>
          <a>Explore</a>
          <a>Stories</a>
        </nav>
      </header>

      <main className="hero">
        <h1>Life is Better in <span className="accent">Motion</span></h1>
        <p className="lead">Exploring new places, capturing beautiful moments.</p>
      </main>

    </div>
  )
}
