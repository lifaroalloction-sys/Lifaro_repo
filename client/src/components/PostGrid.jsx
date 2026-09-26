import React, {useState} from 'react'

function PostTile({src, alt, onOpen}){
  return (
    <div className="post-tile" onClick={onOpen} role="button" tabIndex={0}>
      <img src={src} alt={alt} />
    </div>
  )
}

function PostModal({items, current, onClose}){
  const [index, setIndex] = useState(current)
  if(index == null) return null
  const next = ()=> setIndex((i)=> (i+1) % items.length)
  const prev = ()=> setIndex((i)=> (i-1+items.length) % items.length)
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-inner" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <button className="modal-nav left" onClick={prev}>‹</button>
        <img src={items[index]} alt={`post-${index}`} />
        <button className="modal-nav right" onClick={next}>›</button>
      </div>
    </div>
  )
}

export default function PostGrid(){
  const sample = [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80',
    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1200&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80'
  ]
  const [openIndex, setOpenIndex] = useState(null)
  return (
    <>
      <section className="post-grid">
        {sample.map((s,i)=> <PostTile key={i} src={s} alt={`post-${i}`} onOpen={()=>setOpenIndex(i)} />)}
      </section>
      {openIndex!==null && <PostModal items={sample} current={openIndex} onClose={()=>setOpenIndex(null)} />}
    </>
  )
}
