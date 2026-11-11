import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  customerDesignsApi,
  customerEnquiriesApi,
  customerPurchaseRequestsApi,
  clearCustomerSession,
  getCustomerUser,
  imageUrl
} from '../api/client.js'

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

const ENQUIRY_TYPES = [
  'Price Details',
  'Materials',
  'Customization',
  'Dimensions',
  'Availability',
  'Other',
]

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const customer = getCustomerUser()

  // activeTab: 'catalogue' | 'enquiries' | 'purchases'
  const [activeTab, setActiveTab] = useState('catalogue')

  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeModalDesign, setActiveModalDesign] = useState(null)
  const [activeModalImageIndex, setActiveModalImageIndex] = useState(0)

  // Card-specific active preview image tracking: { [designId]: imageIndex }
  const [cardImageIndices, setCardImageIndices] = useState({})

  // My Enquiries & Purchases
  const [myEnquiries, setMyEnquiries] = useState([])
  const [loadingEnquiries, setLoadingEnquiries] = useState(false)
  const [myPurchases, setMyPurchases] = useState([])
  const [loadingPurchases, setLoadingPurchases] = useState(false)

  // Global notice banner for dashboard
  const [feedbackNotice, setFeedbackNotice] = useState(null)

  // Modal forms
  const [enquiryModalDesign, setEnquiryModalDesign] = useState(null)
  const [enqPhone, setEnqPhone] = useState('')
  const [enqType, setEnqType] = useState('Price Details')
  const [enqMessage, setEnqMessage] = useState('')
  const [enqBusy, setEnqBusy] = useState(false)
  const [enqError, setEnqError] = useState('')
  const [enqSuccess, setEnqSuccess] = useState('')

  const [purchaseModalDesign, setPurchaseModalDesign] = useState(null)
  const [purPhone, setPurPhone] = useState('')
  const [purAddress, setPurAddress] = useState('')
  const [purRequirements, setPurRequirements] = useState('')
  const [purContactMethod, setPurContactMethod] = useState('Phone')
  const [purBusy, setPurBusy] = useState(false)
  const [purError, setPurError] = useState('')
  const [purSuccess, setPurSuccess] = useState('')

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

  async function loadMyEnquiries() {
    setLoadingEnquiries(true)
    try {
      const data = await customerEnquiriesApi.listMine()
      setMyEnquiries(data || [])
    } catch (err) {
      console.error('Failed to load enquiries', err)
    } finally {
      setLoadingEnquiries(false)
    }
  }

  async function loadMyPurchases() {
    setLoadingPurchases(true)
    try {
      const data = await customerPurchaseRequestsApi.listMine()
      setMyPurchases(data || [])
    } catch (err) {
      console.error('Failed to load purchase requests', err)
    } finally {
      setLoadingPurchases(false)
    }
  }

  useEffect(() => {
    loadDesigns()
    loadMyEnquiries()
    loadMyPurchases()
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

  // Open Enquiry Form
  function openEnquiryForm(design) {
    setEnquiryModalDesign(design)
    setEnqPhone('')
    setEnqType('Price Details')
    setEnqMessage('')
    setEnqError('')
    setEnqSuccess('')
  }

  function closeEnquiryForm() {
    setEnquiryModalDesign(null)
  }

  async function handleEnquirySubmit(e) {
    e.preventDefault()
    setEnqError('')
    setEnqSuccess('')

    if (!enqPhone.trim()) {
      setEnqError('Please enter your phone number.')
      return
    }
    if (!enqMessage.trim()) {
      setEnqError('Please enter your enquiry message.')
      return
    }

    setEnqBusy(true)
    try {
      const response = await customerEnquiriesApi.submit({
        designId: enquiryModalDesign.id,
        phoneNumber: enqPhone.trim(),
        enquiryType: enqType,
        message: enqMessage.trim(),
      })

      setEnqSuccess(`Thank you! Your enquiry for "${enquiryModalDesign.name}" has been submitted successfully.`)
      await loadMyEnquiries()
      setTimeout(() => {
        closeEnquiryForm()
        setFeedbackNotice({
          type: 'success',
          text: `Enquiry for "${enquiryModalDesign.name}" submitted! You can track it under "My Enquiries".`
        })
      }, 1400)
    } catch (err) {
      setEnqError(err.message || 'Failed to submit enquiry. Please try again.')
    } finally {
      setEnqBusy(false)
    }
  }

  // Open Purchase Request Form
  function openPurchaseForm(design) {
    setPurchaseModalDesign(design)
    setPurPhone('')
    setPurAddress('')
    setPurRequirements('')
    setPurContactMethod('Phone')
    setPurError('')
    setPurSuccess('')
  }

  function closePurchaseForm() {
    setPurchaseModalDesign(null)
  }

  async function handlePurchaseSubmit(e) {
    e.preventDefault()
    setPurError('')
    setPurSuccess('')

    if (!purPhone.trim()) {
      setPurError('Please enter your phone number.')
      return
    }
    if (!purAddress.trim()) {
      setPurError('Please enter your delivery or project address.')
      return
    }

    setPurBusy(true)
    try {
      const response = await customerPurchaseRequestsApi.submit({
        designId: purchaseModalDesign.id,
        phoneNumber: purPhone.trim(),
        deliveryAddress: purAddress.trim(),
        additionalRequirements: purRequirements.trim(),
        preferredContactMethod: purContactMethod,
      })

      setPurSuccess(`Purchase request submitted for "${purchaseModalDesign.name}"! Our team will contact you shortly.`)
      await loadMyPurchases()
      setTimeout(() => {
        closePurchaseForm()
        setFeedbackNotice({
          type: 'success',
          text: `Purchase request for "${purchaseModalDesign.name}" confirmed! You can track progress in "My Purchase Requests".`
        })
      }, 1400)
    } catch (err) {
      setPurError(err.message || 'Failed to submit purchase request. Please try again.')
    } finally {
      setPurBusy(false)
    }
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
      {/* Top Navigation Header */}
      <header className="customer-header">
        <div className="customer-header-inner">
          <div className="customer-brand" onClick={() => setActiveTab('catalogue')} style={{ cursor: 'pointer' }}>
            <span className="brand-mark small">L<span>+</span>L</span>
            <div>
              <strong>leaf &amp; lattice</strong>
              <small>INTERIOR DESIGN STUDIO</small>
            </div>
          </div>

          {/* Customer Workspace Tabs */}
          <nav className="customer-nav-tabs" aria-label="Customer navigation">
            <button
              type="button"
              className={`customer-tab-btn ${activeTab === 'catalogue' ? 'active' : ''}`}
              onClick={() => setActiveTab('catalogue')}
            >
              Curated Catalogue
            </button>
            <button
              type="button"
              className={`customer-tab-btn ${activeTab === 'enquiries' ? 'active' : ''}`}
              onClick={() => { setActiveTab('enquiries'); loadMyEnquiries(); }}
            >
              My Enquiries
              {myEnquiries.length > 0 && <span className="tab-count-pill">{myEnquiries.length}</span>}
            </button>
            <button
              type="button"
              className={`customer-tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={() => { setActiveTab('purchases'); loadMyPurchases(); }}
            >
              My Purchase Requests
              {myPurchases.length > 0 && <span className="tab-count-pill">{myPurchases.length}</span>}
            </button>
          </nav>

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

      {/* Global Feedback Banner */}
      {feedbackNotice && (
        <div className={`notice customer-banner ${feedbackNotice.type}`}>
          <span>{feedbackNotice.text}</span>
          <button onClick={() => setFeedbackNotice(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* TAB 1: CURATED CATALOGUE */}
      {activeTab === 'catalogue' && (
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
                        <span className="materials-label">Finishes &amp; Materials:</span>
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

                      {/* Card Actions */}
                      <div className="client-card-footer">
                        <button
                          type="button"
                          className="button primary full"
                          onClick={() => openDetails(item)}
                        >
                          Explore Concept Details ↗
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </main>
      )}

      {/* TAB 2: MY ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <main className="customer-main">
          <section className="customer-section-header">
            <div>
              <p className="eyebrow">Your Activity</p>
              <h1>My Enquiries</h1>
              <p className="hero-subtext">Track questions, custom requests, and studio responses for design concepts.</p>
            </div>
            <button
              type="button"
              className="button subtle"
              onClick={loadMyEnquiries}
              disabled={loadingEnquiries}
            >
              {loadingEnquiries ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </section>

          {loadingEnquiries ? (
            <div className="catalogue-loading">
              <div className="spinner" />
              <p>Loading your enquiries…</p>
            </div>
          ) : myEnquiries.length === 0 ? (
            <div className="catalogue-empty">
              <span className="empty-icon">✉</span>
              <h3>No enquiries submitted yet</h3>
              <p>Have questions regarding pricing, materials, or custom dimensions? Browse designs and click "Enquire Now".</p>
              <button
                type="button"
                className="button primary"
                onClick={() => setActiveTab('catalogue')}
              >
                Browse Design Catalogue
              </button>
            </div>
          ) : (
            <div className="customer-request-list">
              {myEnquiries.map((item) => (
                <div key={item.id} className="customer-request-card">
                  <div className="request-card-header">
                    <div>
                      <span className="category-tag">{item.enquiryType}</span>
                      <h2 className="request-design-title">{item.designName}</h2>
                      <small className="muted">Submitted on {new Date(item.createdAtUtc).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</small>
                    </div>
                    <span className={`status-pill pill-${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="request-body">
                    <p className="request-message-label"><strong>Your Question:</strong></p>
                    <p className="request-message-content">{item.message}</p>

                    {item.adminResponse ? (
                      <div className="admin-response-box">
                        <strong>Studio Response:</strong>
                        <p>{item.adminResponse}</p>
                        <small className="muted">Last updated {new Date(item.updatedAtUtc).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}</small>
                      </div>
                    ) : (
                      <div className="pending-status-note">
                        ⏳ <em>Our design team has received your enquiry and is reviewing it.</em>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* TAB 3: MY PURCHASE REQUESTS */}
      {activeTab === 'purchases' && (
        <main className="customer-main">
          <section className="customer-section-header">
            <div>
              <p className="eyebrow">Your Activity</p>
              <h1>My Purchase Requests</h1>
              <p className="hero-subtext">Review the status and studio updates for your requested design purchases.</p>
            </div>
            <button
              type="button"
              className="button subtle"
              onClick={loadMyPurchases}
              disabled={loadingPurchases}
            >
              {loadingPurchases ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </section>

          {loadingPurchases ? (
            <div className="catalogue-loading">
              <div className="spinner" />
              <p>Loading your purchase requests…</p>
            </div>
          ) : myPurchases.length === 0 ? (
            <div className="catalogue-empty">
              <span className="empty-icon">🛒</span>
              <h3>No purchase requests placed yet</h3>
              <p>Found a design concept you love? Open the design and click "Request to Purchase" to initiate an acquisition.</p>
              <button
                type="button"
                className="button primary"
                onClick={() => setActiveTab('catalogue')}
              >
                Explore Curated Catalogue
              </button>
            </div>
          ) : (
            <div className="customer-request-list">
              {myPurchases.map((item) => (
                <div key={item.id} className="customer-request-card">
                  <div className="request-card-header">
                    <div>
                      <span className="category-tag">{item.designCategory}</span>
                      <h2 className="request-design-title">{item.designName}</h2>
                      <div className="request-price-tag">Estimated Price: <strong>{money(item.designPrice)}</strong></div>
                      <small className="muted">Requested on {new Date(item.createdAtUtc).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</small>
                    </div>
                    <span className={`status-pill pill-${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="request-body">
                    <div className="request-meta-grid">
                      <div>
                        <span className="meta-label">Project / Delivery Address:</span>
                        <p className="meta-value">{item.deliveryAddress}</p>
                      </div>
                      <div>
                        <span className="meta-label">Preferred Contact:</span>
                        <p className="meta-value">{item.preferredContactMethod} ({item.phoneNumber})</p>
                      </div>
                    </div>

                    {item.additionalRequirements && (
                      <div className="request-additional-notes">
                        <span className="meta-label">Customization &amp; Details:</span>
                        <p className="meta-value">{item.additionalRequirements}</p>
                      </div>
                    )}

                    {item.adminResponse ? (
                      <div className="admin-response-box">
                        <strong>Studio Response / Project Status:</strong>
                        <p>{item.adminResponse}</p>
                        <small className="muted">Last updated {new Date(item.updatedAtUtc).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}</small>
                      </div>
                    ) : (
                      <div className="pending-status-note">
                        ⏳ <em>Our studio is reviewing your project address and concept specifications to schedule a consultation.</em>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

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
                  <h3>Design Overview &amp; Layout Mood</h3>
                  <p>{activeModalDesign.description || 'No detailed mood notes provided.'}</p>
                </div>

                <div className="modal-materials-section">
                  <h3>Included Finishes &amp; Materials ({activeModalDesign.materials.length})</h3>
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

                {/* Requirement 1: Two Prominent Actions (Enquire Now & Request to Purchase) */}
                <div className="modal-design-actions">
                  <button
                    type="button"
                    className="button primary full action-purchase-btn"
                    onClick={() => {
                      const d = activeModalDesign
                      closeDetails()
                      openPurchaseForm(d)
                    }}
                  >
                    🛒 Request to Purchase
                  </button>
                  <button
                    type="button"
                    className="button subtle full action-enquire-btn"
                    onClick={() => {
                      const d = activeModalDesign
                      closeDetails()
                      openEnquiryForm(d)
                    }}
                  >
                    ✉ Enquire Now
                  </button>
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

      {/* Customer Enquiry Form Modal */}
      {enquiryModalDesign && (
        <div className="modal-backdrop" onClick={closeEnquiryForm}>
          <div className="customer-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Studio Consultation</p>
                <h2>Enquire About {enquiryModalDesign.name}</h2>
              </div>
              <button className="modal-close-btn" onClick={closeEnquiryForm}>×</button>
            </div>

            {enqError && <div className="notice error">{enqError}</div>}
            {enqSuccess && <div className="notice success">{enqSuccess}</div>}

            <form onSubmit={handleEnquirySubmit} className="stack-form modal-form-body">
              <div className="form-two-col">
                <label>
                  Customer Name
                  <input
                    type="text"
                    value={customer.fullName || ''}
                    disabled
                    className="readonly-input"
                  />
                </label>
                <label>
                  Email Address
                  <input
                    type="email"
                    value={customer.email || ''}
                    disabled
                    className="readonly-input"
                  />
                </label>
              </div>

              <div className="form-two-col">
                <label>
                  Phone Number *
                  <input
                    type="tel"
                    required
                    value={enqPhone}
                    onChange={(e) => setEnqPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </label>

                <label>
                  Enquiry Type *
                  <select
                    value={enqType}
                    onChange={(e) => setEnqType(e.target.value)}
                    required
                  >
                    {ENQUIRY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Selected Design
                  <input
                    type="text"
                    value={`${enquiryModalDesign.name} (${money(enquiryModalDesign.totalPrice)})`}
                    disabled
                    className="readonly-input"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Your Message or Question *
                  <textarea
                    rows={4}
                    required
                    value={enqMessage}
                    onChange={(e) => setEnqMessage(e.target.value)}
                    placeholder="Enter your question regarding dimensions, customization, finish options, or delivery schedule…"
                  />
                </label>
              </div>

              <div className="modal-form-actions">
                <button
                  type="submit"
                  className="button primary full"
                  disabled={enqBusy || Boolean(enqSuccess)}
                >
                  {enqBusy ? 'Submitting Enquiry…' : 'Submit Enquiry ↗'}
                </button>
                <button
                  type="button"
                  className="button subtle full"
                  onClick={closeEnquiryForm}
                  disabled={enqBusy}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Purchase Request Form Modal */}
      {purchaseModalDesign && (
        <div className="modal-backdrop" onClick={closePurchaseForm}>
          <div className="customer-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Design Acquisition</p>
                <h2>Request to Purchase – {purchaseModalDesign.name}</h2>
              </div>
              <button className="modal-close-btn" onClick={closePurchaseForm}>×</button>
            </div>

            {purError && <div className="notice error">{purError}</div>}
            {purSuccess && <div className="notice success">{purSuccess}</div>}

            <form onSubmit={handlePurchaseSubmit} className="stack-form modal-form-body">
              <div className="form-two-col">
                <label>
                  Customer Name
                  <input
                    type="text"
                    value={customer.fullName || ''}
                    disabled
                    className="readonly-input"
                  />
                </label>
                <label>
                  Email Address
                  <input
                    type="email"
                    value={customer.email || ''}
                    disabled
                    className="readonly-input"
                  />
                </label>
              </div>

              <div className="form-two-col">
                <label>
                  Selected Design
                  <input
                    type="text"
                    value={purchaseModalDesign.name}
                    disabled
                    className="readonly-input"
                  />
                </label>
                <label>
                  Design Price (INR)
                  <input
                    type="text"
                    value={money(purchaseModalDesign.totalPrice)}
                    disabled
                    className="readonly-input price-bold"
                  />
                </label>
              </div>

              <div className="form-two-col">
                <label>
                  Phone Number *
                  <input
                    type="tel"
                    required
                    value={purPhone}
                    onChange={(e) => setPurPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </label>

                <label>
                  Preferred Contact Method *
                  <select
                    value={purContactMethod}
                    onChange={(e) => setPurContactMethod(e.target.value)}
                    required
                  >
                    <option value="Phone">Phone Call / WhatsApp</option>
                    <option value="Email">Email Communication</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Project / Delivery Address *
                  <textarea
                    rows={3}
                    required
                    value={purAddress}
                    onChange={(e) => setPurAddress(e.target.value)}
                    placeholder="Enter the complete site or delivery address (Street, Apartment/Villa, City, Pincode)…"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Additional Requirements or Customization Details (Optional)
                  <textarea
                    rows={3}
                    value={purRequirements}
                    onChange={(e) => setPurRequirements(e.target.value)}
                    placeholder="E.g., specific dimensions, wall orientation, timeline preferences, or specific material alterations…"
                  />
                </label>
              </div>

              <div className="phase-notice-box">
                ℹ <strong>Consultation &amp; Execution Phase:</strong> Submitting this request sends your project details to our studio architects. A team member will verify site specifications with you before finalizing the schedule. No payment is charged online in this phase.
              </div>

              <div className="modal-form-actions">
                <button
                  type="submit"
                  className="button primary full"
                  disabled={purBusy || Boolean(purSuccess)}
                >
                  {purBusy ? 'Submitting Purchase Request…' : 'Confirm Purchase Request ↗'}
                </button>
                <button
                  type="button"
                  className="button subtle full"
                  onClick={closePurchaseForm}
                  disabled={purBusy}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
