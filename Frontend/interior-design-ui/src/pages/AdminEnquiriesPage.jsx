import { useEffect, useState } from 'react'
import { adminEnquiriesApi } from '../api/client.js'

const STATUSES = ['All', 'Pending', 'Contacted', 'Resolved', 'Rejected']

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [activeItem, setActiveItem] = useState(null)

  // Status update modal state
  const [editStatus, setEditStatus] = useState('Pending')
  const [adminResponse, setAdminResponse] = useState('')
  const [updating, setUpdating] = useState(false)

  async function loadEnquiries() {
    setLoading(true)
    try {
      const data = await adminEnquiriesApi.list({
        status: statusFilter === 'All' ? '' : statusFilter,
        search: search.trim()
      })
      setEnquiries(data || [])
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to load enquiries.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEnquiries()
  }, [statusFilter])

  function handleSearchSubmit(e) {
    e.preventDefault()
    loadEnquiries()
  }

  function openDetails(item) {
    setActiveItem(item)
    setEditStatus(item.status)
    setAdminResponse(item.adminResponse || '')
  }

  function closeDetails() {
    setActiveItem(null)
  }

  async function handleSaveStatus(e) {
    e.preventDefault()
    if (!activeItem) return

    if (!window.confirm(`Are you sure you want to update this enquiry to status "${editStatus}"?`)) {
      return
    }

    setUpdating(true)
    setNotice(null)
    try {
      const updated = await adminEnquiriesApi.updateStatus(activeItem.id, {
        status: editStatus,
        adminResponse: adminResponse.trim()
      })
      setNotice({ type: 'success', text: `Enquiry #${updated.id} status updated to ${updated.status}.` })
      setActiveItem(updated)
      await loadEnquiries()
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to update enquiry status.' })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="page-content">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Customer Relations</p>
          <h1>Customer Enquiries</h1>
          <p className="muted">Review, respond to, and track design questions submitted by customers.</p>
        </div>
        <span className="count-pill">{enquiries.length} {enquiries.length === 1 ? 'enquiry' : 'enquiries'}</span>
      </header>

      {notice && (
        <div className={`notice ${notice.type}`}>
          {notice.text}
          <button onClick={() => setNotice(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="status-tabs" role="tablist">
          {STATUSES.map(s => (
            <button
              key={s}
              type="button"
              className={`status-tab-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="admin-search-form">
          <input
            type="text"
            placeholder="Search by customer name, email, or design…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
          <button type="submit" className="button subtle">Search</button>
          {search && (
            <button
              type="button"
              className="button subtle"
              onClick={() => { setSearch(''); loadEnquiries(); }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Enquiries Table */}
      {loading ? (
        <div className="panel empty-panel">
          <div className="spinner" />
          <p>Loading enquiries…</p>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="panel empty-panel">
          <span className="empty-icon">✉</span>
          <h3>No enquiries found</h3>
          <p>
            {statusFilter !== 'All' || search
              ? 'No customer enquiries match your current status or search filter.'
              : 'No customer enquiries have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="panel table-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Design</th>
                <th>Enquiry Type</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.CustomerName || item.customerName}</strong>
                    <br />
                    <small className="muted">{item.CustomerEmail || item.customerEmail}</small>
                  </td>
                  <td>{item.PhoneNumber || item.phoneNumber}</td>
                  <td>
                    <strong>{item.DesignName || item.designName}</strong>
                    <br />
                    <small className="muted">{item.DesignCategory || item.designCategory}</small>
                  </td>
                  <td>
                    <span className="category-tag">{item.EnquiryType || item.enquiryType}</span>
                  </td>
                  <td>
                    <span className={`status-pill pill-${(item.Status || item.status).toLowerCase()}`}>
                      {item.Status || item.status}
                    </span>
                  </td>
                  <td>
                    {new Date(item.CreatedAtUtc || item.createdAtUtc).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="button subtle small-btn"
                      onClick={() => openDetails(item)}
                    >
                      View &amp; Respond ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details & Status Modal */}
      {activeItem && (
        <div className="modal-backdrop" onClick={closeDetails}>
          <div className="admin-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Enquiry #{activeItem.id}</h2>
              <button className="modal-close-btn" onClick={closeDetails}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field">
                  <label>Customer Name</label>
                  <div><strong>{activeItem.customerName}</strong></div>
                </div>

                <div className="detail-field">
                  <label>Email Address</label>
                  <div><a href={`mailto:${activeItem.customerEmail}`}>{activeItem.customerEmail}</a></div>
                </div>

                <div className="detail-field">
                  <label>Phone Number</label>
                  <div><a href={`tel:${activeItem.phoneNumber}`}>{activeItem.phoneNumber}</a></div>
                </div>

                <div className="detail-field">
                  <label>Selected Design</label>
                  <div>
                    <strong>{activeItem.designName}</strong> ({activeItem.designCategory})
                  </div>
                </div>

                <div className="detail-field full-col">
                  <label>Enquiry Type</label>
                  <div><span className="category-tag">{activeItem.enquiryType}</span></div>
                </div>

                <div className="detail-field full-col">
                  <label>Customer Message</label>
                  <div className="message-box">{activeItem.message}</div>
                </div>

                <div className="detail-field full-col">
                  <label>Submission Date</label>
                  <div>{new Date(activeItem.createdAtUtc).toLocaleString()}</div>
                </div>
              </div>

              {/* Status Update Form */}
              <form onSubmit={handleSaveStatus} className="status-update-box">
                <h3>Update Enquiry Status &amp; Customer Response</h3>

                <div className="form-row">
                  <label>
                    Enquiry Status
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="admin-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Admin Response / Internal Notes
                    <textarea
                      rows={4}
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Enter a response or note to communicate progress to the customer…"
                      className="admin-textarea"
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="button primary" disabled={updating}>
                    {updating ? 'Saving Changes…' : 'Save Status & Response'}
                  </button>
                  <button type="button" className="button subtle" onClick={closeDetails}>
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
