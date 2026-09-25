import React, {useEffect, useState} from 'react'
import axios from 'axios'

function Header(){
  return (
    <header className="header">
      <div className="logo">JourneyFrames</div>
      <nav className="nav">
        <a>Home</a>
        <a>Explore</a>
        <a>Stories</a>
      </nav>
      <div className="profile">Me</div>
    </header>
  )
}

function Hero(){
  return (
    <section className="hero">
      <div className="hero-inner">
        <h1>Life is Better in <span className="accent">Motion</span></h1>
        <p>Capture your journey — travel, culture, moments.</p>
        <button className="cta">Watch My Journey</button>
      </div>
    </section>
  )
}

function FolderCard({f, onOpen}){
  return (
    <div className="folder" onClick={()=>onOpen(f)}>
      <div className="thumb">{f.mimeType === 'application/vnd.google-apps.folder' ? '📁' : '🖼️'}</div>
      <div className="name">{f.name}</div>
    </div>
  )
}

export default function App(){
  const [files, setFiles] = useState([])
  const [folder, setFolder] = useState(null)

  useEffect(()=>{
    // default folderId can be provided by user, or fetched via server
  },[])

  async function openFolder(f){
    if (f.mimeType === 'application/vnd.google-apps.folder'){
      const resp = await axios.get('http://localhost:4000/api/drive/list', { params: { folderId: f.id } })
      setFiles(resp.data.files)
      setFolder(f)
    }
  }

  async function loadRoot(){
    const rootId = prompt('Enter Google Drive folder ID (parent)')
    if (!rootId) return
    const resp = await axios.get('http://localhost:4000/api/drive/list', { params: { folderId: rootId } })
    setFiles(resp.data.files)
    setFolder({ id: rootId, name: 'Root' })
  }

  return (
    <div className="app">
      <Header />
      <Hero />
      <div className="controls">
        <button onClick={loadRoot}>Connect Drive Folder</button>
        {folder && <div className="crumbs">{folder.name}</div>}
      </div>

      <main className="grid">
        {files.map(f=> <FolderCard key={f.id} f={f} onOpen={openFolder} />)}
      </main>
    </div>
  )
}
