import './WireframesGallery.css'

// Import all wireframe images generated from the SDD
const modules = import.meta.globEager('/src/assets/wireframes/*.{png,jpg,jpeg}')
const images = Object.keys(modules)
  .sort()
  .map((p) => ({ path: p, src: modules[p].default }))

export default function WireframesGallery() {
  return (
    <section className="wireframes-gallery">
      <h2>SDD Wireframes</h2>
      <p className="note">Auto-extracted from `Software Design Description.pdf`</p>
      <div className="grid">
        {images.map((img) => (
          <figure key={img.path} className="wireframe-item">
            <img src={img.src} alt={img.path} />
            <figcaption>{img.path.split('/').pop()}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
