import React from 'react'

function PostTile({src, alt}){
  return (
    <div className="post-tile">
      <img src={src} alt={alt} />
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
  return (
    <section className="post-grid">
      {sample.map((s,i)=> <PostTile key={i} src={s} alt={`post-${i}`} />)}
    </section>
  )
}
