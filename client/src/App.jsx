import React from 'react'
import Profile from './components/Profile'
import PostGrid from './components/PostGrid'

function Header(){
  return (
    <header className="header">
      <div className="logo">JourneyFrames</div>
      <nav className="nav">
        <a>Home</a>
        <a>Explore</a>
        <a>Stories</a>
        <a>About</a>
      </nav>
    </header>
  )
}

function Hero(){
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1>Life is Better in <span className="accent">Motion</span></h1>
        <p className="lead">Exploring new places, capturing beautiful moments, and turning them into stories.</p>
        <div className="cta-row">
          <a className="btn primary" href="#explore">Start Exploring</a>
        </div>
      </div>
    </section>
  )
}

function Destinations(){
  return (
    <section id="explore" className="cards">
      <h2>Popular Destinations</h2>
      <div className="card-grid">
        <article className="card">
          <div className="card-media" style={{backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=60')"}} />
          <h3>Goa</h3>
          <p>Sun, sand and serenity.</p>
        </article>
        <article className="card">
          <div className="card-media" style={{backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=60')"}} />
          <h3>Himalayas</h3>
          <p>High peaks, deep moments.</p>
        </article>
        <article className="card">
          <div className="card-media" style={{backgroundImage: "url('https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&q=60')"}} />
          <h3>Kerala</h3>
          <p>Backwaters and calm.</p>
        </article>
      </div>
    </section>
  )
}

export default function App(){
  return (
    <div>
      <Header />
      <Hero />
      <div className="container profile-area">
        <Profile />
        <PostGrid />
      </div>
      <footer className="site-footer">
        <div>
          <h4>About JourneyFrames</h4>
          <p>Built to showcase travel memories and cinematic edits.</p>
        </div>
        <div>
          <small>© 2026 JourneyFrames</small>
        </div>
      </footer>
    </div>
  )
}
