import { useEffect, useState } from 'react'
import { adminPurchaseRequestsApi } from '../api/client.js'

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const STATUSES = ['All', 'Pending', 'Contacted', 'Approved', 'Rejected', 'Completed']

export default function AdminPurchaseRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [activeItem, setActiveItem] = useState(null)

  // Status update modal state
  const [editStatus, setEditStatus] = useState('Pending')
  const [adminResponse, setAdminResponse] = useState('')
  const [updating, setUpdating] = useState(false)

  async function loadRequests() {
    setLoading(true)
    try {
      const data = await adminPurchaseRequestsApi.list({
        status: statusFilter === 'All' ? '' : statusFilter,
        search: search.trim()
      })
      setRequests(data || [])
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to load purchase requests.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [statusFilter])

  function handleSearchSubmit(e) {
    e.preventDefault()
    loadRequests()
  }

  function openDetails(item) {
    setActiveItem(item)
    setEditStatus(item.status)
    setAdminResponse(item.adminResponse || '')
  }

  function closeDetails() {
    setActiveItem(null)
  }

  async function handleSaveStatus(targetStatus) {
    const finalStatus = targetStatus || editStatus
    if (!activeItem) return

    if (!window.confirm(`Are you sure you want to update this purchase request to status "${finalStatus}"?`)) {
      return
    }

    setUpdating(true)
    setNotice(null)
    try {
      const updated = await adminPurchaseRequestsApi.updateStatus(activeItem.id, {
        status: finalStatus,
        adminResponse: adminResponse.trim()
      })
      setNotice({ type: 'success', text: `Purchase Request #${updated.id} status updated to ${updated.status}.` })
      setActiveItem(updated)
      setEditStatus(updated.status)
      await loadRequests()
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to update request status.' })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="page-content">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Studio Orders &amp; Acquisitions</p>
          <h1>Purchase Requests</h1>
          <p className="muted">Review, verify, and approve customer purchase requests for design concepts.</p>
        </div>
        <span className="count-pill">{requests.length} {requests.length === 1 ? 'request' : 'requests'}</span>
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
            placeholder="Search by customer, email, or design name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
          <button type="submit" className="button subtle">Search</button>
          {search && (
            <button
              type="button"
              className="button subtle"
              onClick={() => { setSearch(''); loadRequests(); }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="panel empty-panel">
          <div className="spinner" />
          <p>Loading purchase requests…</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="panel empty-panel">
          <span className="empty-icon">🛒</span>
          <h3>No purchase requests found</h3>
          <p>
            {statusFilter !== 'All' || search
              ? 'No customer purchase requests match your current filters.'
              : 'No customer purchase requests have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="panel table-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Requested Design</th>
                <th>Design Price</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.CustomerName || item.customerName}</strong>
                    <br />
                    <small className="muted">{item.CustomerEmail || item.customerEmail}</small>
                  </td>
                  <td>
                    <div>{item.PhoneNumber || item.phoneNumber}</div>
                    <small className="muted">Prefers: {item.PreferredContactMethod || item.preferredContactMethod}</small>
                  </td>
                  <td>
                    <strong>{item.DesignName || item.designName}</strong>
                    <br />
                    <small className="muted">{item.DesignCategory || item.designCategory}</small>
                  </td>
                  <td>
                    <strong>{money(item.DesignPrice || item.designPrice)}</strong>
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
                      Review Request ↗
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
              <h2>Purchase Request #{activeItem.id}</h2>
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
                  <label>Preferred Contact</label>
                  <div><span className="category-tag">{activeItem.preferredContactMethod}</span></div>
                </div>

                <div className="detail-field">
                  <label>Requested Design</label>
                  <div><strong>{activeItem.designName}</strong> ({activeItem.designCategory})</div>
                </div>

                <div className="detail-field">
                  <label>Actual Design Price (INR)</label>
                  <div><strong className="price-highlight">{money(activeItem.designPrice)}</strong></div>
                </div>

                <div className="detail-field full-col">
                  <label>Delivery / Project Address</label>
                  <div className="message-box">{activeItem.deliveryAddress}</div>
                </div>

                {activeItem.additionalRequirements && (
                  <div className="detail-field full-col">
                    <label>Additional Customization &amp; Requirements</label>
                    <div className="message-box">{activeItem.additionalRequirements}</div>
                  </div>
                )}

                <div className="detail-field full-col">
                  <label>Request Date</label>
                  <div>{new Date(activeItem.createdAtUtc).toLocaleString()}</div>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="status-update-box">
                <h3>Update Request Status &amp; Admin Notes</h3>

                {/* Quick Action Buttons */}
                <div className="quick-status-actions">
                  <span className="muted">Quick Status:</span>
                  <button
                    type="button"
                    className="button subtle small-btn"
                    onClick={() => { setEditStatus('Contacted'); handleSaveStatus('Contacted'); }}
                    disabled={updating}
                  >
                    Mark Contacted
                  </button>
                  <button
                    type="button"
                    className="button primary small-btn"
                    onClick={() => { setEditStatus('Approved'); handleSaveStatus('Approved'); }}
                    disabled={updating}
                  >
                    ✓ Approve Request
                  </button>
                  <button
                    type="button"
                    className="button danger-ghost small-btn"
                    onClick={() => { setEditStatus('Rejected'); handleSaveStatus('Rejected'); }}
                    disabled={updating}
                  >
                    ✕ Reject Request
                  </button>
                  <button
                    type="button"
                    className="button subtle small-btn"
                    onClick={() => { setEditStatus('Completed'); handleSaveStatus('Completed'); }}
                    disabled={updating}
                  >
                    ★ Mark Completed
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveStatus(); }}>
                  <div className="form-row">
                    <label>
                      Request Status
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="admin-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </label>
                  </div>

                  <div className="form-row">
                    <label>
                      Admin Response / Note (Customer will see this response)
                      <textarea
                        rows={4}
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        placeholder="Provide details on estimate, schedule, next steps, or reasons for status change…"
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
        </div>
      )}
    </div>
  )
}
