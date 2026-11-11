import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerDesignsApi, clearCustomerSession, getCustomerUser, imageUrl } from '../api/client.js'

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const CATEGORIES = [
  'All',
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Office',
  'Dining Room',
  'Outdoor',
  'Other',
]

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const customer = getCustomerUser()

  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeModalDesign, setActiveModalDesign] = useState(null)
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0)

  // Card-specific active preview image tracking: { [designId]: imageIndex }
  const [cardImageIndices, setCardImageIndices] = useState({})

  async function loadDesigns() {
    setLoading(true)
    setError('')
    try {
      const data = await customerDesignsApi.list()
      setDesigns(data || [])
    } catch (err) {
      setError(err.message || 'Unable to load interior designs catalogue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDesigns()
  }, [])

  function handleLogout() {
    clearCustomerSession()
    navigate('/', { replace: true })
  }

  function openDetails(item) {
    setActiveModalDesign(item)
    setActiveModalImageIndex(0)
  }

  function closeDetails() {
    setActiveModalDesign(null)
  }

  // Filtered designs based on category and search query
  const filteredDesigns = useMemo(() => {
    return designs.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory
      const query = searchQuery.trim().toLowerCase()
      if (!query) return matchesCategory

      const matchesName = item.name.toLowerCase().includes(query)
      const matchesDesc = (item.description || '').toLowerCase().includes(query)
      const matchesMaterial = (item.materials || []).some((m) =>
        m.name.toLowerCase().includes(query)
      )
      return matchesCategory && (matchesName || matchesDesc || matchesMaterial)
    })
  }, [designs, selectedCategory, searchQuery])

  return (
    <div className="customer-shell">
      {/* Top Navigation */}
      <header className="customer-header">
        <div className="customer-header-inner">
          <div className="customer-brand">
            <span className="brand-mark small">L<span>+</span>L</span>
            <div>
              <strong>leaf & lattice</strong>
              <small>CLIENT CATALOGUE</small>
            </div>
          </div>

          <div className="customer-profile-nav">
            <div className="customer-greeting">
              <span className="customer-avatar">
                {(customer.fullName || customer.email || 'C').slice(0, 1).toUpperCase()}
              </span>
              <div className="customer-details">
                <strong>{customer.fullName || 'Valued Client'}</strong>
                <small>{customer.email || 'Client'}</small>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="button subtle logout-client-btn"
              title="Sign Out"
            >
              Sign Out ↗
            </button>
          </div>
        </div>
      </header>

      {/* Main Catalogue Area */}
      <main className="customer-main">
        {/* Hero Banner */}
        <section className="customer-hero">
          <p className="eyebrow">Bespoke Living Spaces</p>
          <h1>Curated Interior Catalogues</h1>
          <p className="hero-subtext">
            Discover handcrafted room concepts, architectural finishes, and transparent
            project pricing designed by our studio.
          </p>
        </section>

        {/* Filter Bar */}
        <section className="catalogue-controls">
          <div className="category-chips" role="tablist">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search concepts, finishes, materials…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="catalogue-search"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </section>

        {/* Error Notification */}
        {error && (
          <div className="notice error">
            {error}
            <button onClick={loadDesigns} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="catalogue-loading">
            <div className="spinner" />
            <p>Loading curated concepts from our studio…</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          /* Empty State */
          <div className="catalogue-empty">
            <span className="empty-icon">⌂</span>
            <h3>No designs available</h3>
            <p>
              {searchQuery || selectedCategory !== 'All'
                ? 'No published designs match your current search or category filter.'
                : 'Our studio is currently preparing new collections for you. Check back soon!'}
            </p>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                type="button"
                className="button subtle"
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          /* Grid of Published Designs */
          <div className="catalogue-grid">
            {filteredDesigns.map((item) => {
              const activeIndex = cardImageIndices[item.id] || 0
              const currentImg = item.images[activeIndex] || item.images[0]

              return (
                <article className="client-design-card" key={item.id}>
                  {/* Image Display & Thumbnails */}
                  <div className="client-card-image-wrap">
                    {currentImg ? (
                      <img
                        src={imageUrl(currentImg.imagePath)}
                        alt={currentImg.name || item.name}
                        className="client-card-primary-image"
                        loading="lazy"
                        onClick={() => openDetails(item)}
                      />
                    ) : (
                      <div className="gallery-empty">No image available</div>
                    )}

                    <span className="status-badge available">
                      <span className="badge-dot" /> Available for Order
                    </span>

                    {/* Image thumbnails for cards with multiple images */}
                    {item.images.length > 1 && (
                      <div className="card-thumb-strip">
                        {item.images.map((img, idx) => (
                          <button
                            key={img.id}
                            type="button"
                            className={`thumb-btn ${idx === activeIndex ? 'active' : ''}`}
                            onClick={() =>
                              setCardImageIndices((prev) => ({
                                ...prev,
                                [item.id]: idx,
                              }))
                            }
                            aria-label={`View image ${idx + 1}`}
                          >
                            <img src={imageUrl(img.imagePath)} alt="" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="client-card-body">
                    <div className="client-card-header">
                      <span className="client-category-pill">{item.category}</span>
                      <strong className="client-price">{money(item.totalPrice)}</strong>
                    </div>

                    <h2 className="client-design-title">{item.name}</h2>
                    <p className="client-design-desc">
                      {item.description || 'Handcrafted interior concept curated by our studio.'}
                    </p>

                    {/* Materials preview */}
                    <div className="client-materials-section">
                      <span className="materials-label">Finishes & Materials:</span>
                      <div className="materials-chip-list">
                        {item.materials.length > 0 ? (
                          item.materials.map((m) => (
                            <span key={m.id} className="mat-chip" title={m.name}>
                              ◈ {m.name}
                            </span>
                          ))
                        ) : (
                          <span className="mat-chip muted-chip">Custom specifications</span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions (Purely Read-Only!) */}
                    <div className="client-card-footer">
                      <button
                        type="button"
                        className="button primary full"
                        onClick={() => openDetails(item)}
                      >
                        Explore Complete Concept Details ↗
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      {/* Complete Design Details Modal */}
      {activeModalDesign && (
        <div className="modal-backdrop" onClick={closeDetails}>
          <div
            className="design-details-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="modal-close-btn"
              onClick={closeDetails}
              aria-label="Close details"
            >
              ×
            </button>

            <div className="modal-content-grid">
              {/* Left Column: Visual Gallery */}
              <div className="modal-gallery-col">
                <div className="modal-main-image-wrap">
                  {activeModalDesign.images[activeModalImageIndex] ? (
                    <img
                      src={imageUrl(
                        activeModalDesign.images[activeModalImageIndex].imagePath
                      )}
                      alt={activeModalDesign.name}
                      className="modal-main-image"
                    />
                  ) : (
                    <div className="gallery-empty">No image available</div>
                  )}
                  <span className="modal-image-counter">
                    {activeModalImageIndex + 1} /{' '}
                    {Math.max(activeModalDesign.images.length, 1)}
                  </span>
                </div>

                {activeModalDesign.images.length > 1 && (
                  <div className="modal-thumb-row">
                    {activeModalDesign.images.map((img, idx) => (
                      <button
                        key={img.id}
                        type="button"
                        className={`modal-thumb ${
                          idx === activeModalImageIndex ? 'active' : ''
                        }`}
                        onClick={() => setActiveModalImageIndex(idx)}
                      >
                        <img src={imageUrl(img.imagePath)} alt={img.name} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Specifications & Materials */}
              <div className="modal-info-col">
                <div className="modal-tags">
                  <span className="client-category-pill">
                    {activeModalDesign.category}
                  </span>
                  <span className="status-badge available">
                    <span className="badge-dot" /> Available for Order
                  </span>
                </div>

                <h1 className="modal-title">{activeModalDesign.name}</h1>

                <div className="modal-price-box">
                  <span className="modal-price-label">Complete Project Price</span>
                  <strong className="modal-price-value">
                    {money(activeModalDesign.totalPrice)}
                  </strong>
                  <small className="modal-price-note">
                    All-inclusive interior estimate in Indian Rupees (INR)
                  </small>
                </div>

                <div className="modal-desc-section">
                  <h3>Design Overview & Layout Mood</h3>
                  <p>{activeModalDesign.description || 'No detailed mood notes provided.'}</p>
                </div>

                <div className="modal-materials-section">
                  <h3>Included Finishes & Materials ({activeModalDesign.materials.length})</h3>
                  {activeModalDesign.materials.length > 0 ? (
                    <div className="modal-materials-list">
                      {activeModalDesign.materials.map((mat) => (
                        <div key={mat.id} className="modal-mat-item">
                          {mat.imagePath ? (
                            <img
                              src={imageUrl(mat.imagePath)}
                              alt={mat.name}
                              className="modal-mat-img"
                            />
                          ) : (
                            <div className="modal-mat-placeholder">◈</div>
                          )}
                          <div className="modal-mat-info">
                            <strong>{mat.name}</strong>
                            <p>{mat.description || 'Bespoke architectural specification'}</p>
                            {mat.price > 0 && (
                              <span className="mat-unit-price">
                                Material Reference: {money(mat.price)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">No specific materials itemized for this concept.</p>
                  )}
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="button subtle full"
                    onClick={closeDetails}
                  >
                    Back to Design Catalogue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
