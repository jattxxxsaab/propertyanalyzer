import { useState, useEffect } from 'react';
import './RepairOrder.css';

function RepairOrder() {
  const [formData, setFormData] = useState({
    // Asset Information
    assetNumber: '',
    licensePlate: '',
    vin: '',
    make: '',
    model: '',
    year: '',

    // Repair Order Details
    orderNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'pending',

    // Repair Information
    repairType: '',
    customRepairType: '',
    description: '',

    // Service Information
    serviceProvider: '',
    vendorContact: '',
    vendorPhone: '',

    // Cost Information
    laborCost: '',
    partsCost: '',
    taxAmount: '',
    otherCosts: '',

    // Vehicle Condition
    odometerIn: '',
    odometerOut: '',
    dateIn: new Date().toISOString().split('T')[0],
    dateOut: '',
    estimatedCompletionDate: '',

    // Additional Notes
    notes: ''
  });

  const [savedOrders, setSavedOrders] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const repairTypes = [
    'Engine Repair',
    'Transmission Service',
    'Brake System',
    'Suspension & Steering',
    'Electrical System',
    'HVAC System',
    'Tire Service',
    'Oil Change & Lubrication',
    'Body Work & Paint',
    'Glass Repair',
    'Exhaust System',
    'Preventive Maintenance',
    'DOT Inspection',
    'Accident Repair',
    'Other'
  ];

  const priorityLevels = [
    { value: 'critical', label: 'Critical - Vehicle Down', color: '#ef4444' },
    { value: 'high', label: 'High - Safety Issue', color: '#f97316' },
    { value: 'medium', label: 'Medium - Schedule Soon', color: '#eab308' },
    { value: 'low', label: 'Low - Routine', color: '#22c55e' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Load existing repair orders on component mount
  useEffect(() => {
    fetchRepairOrders();
  }, []);

  const fetchRepairOrders = async () => {
    try {
      const response = await fetch('/api/repair-orders');
      const result = await response.json();
      if (result.success) {
        setSavedOrders(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch repair orders:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalCost = () => {
    const labor = parseFloat(formData.laborCost) || 0;
    const parts = parseFloat(formData.partsCost) || 0;
    const tax = parseFloat(formData.taxAmount) || 0;
    const other = parseFloat(formData.otherCosts) || 0;
    return labor + parts + tax + other;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowError(false);

    const orderData = {
      ...formData,
      totalCost: calculateTotalCost()
    };

    try {
      const response = await fetch('/api/repair-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Refresh the orders list
        await fetchRepairOrders();

        // Reset form
        setFormData({
          assetNumber: '',
          licensePlate: '',
          vin: '',
          make: '',
          model: '',
          year: '',
          orderNumber: '',
          orderDate: new Date().toISOString().split('T')[0],
          priority: 'medium',
          status: 'pending',
          repairType: '',
          customRepairType: '',
          description: '',
          serviceProvider: '',
          vendorContact: '',
          vendorPhone: '',
          laborCost: '',
          partsCost: '',
          taxAmount: '',
          otherCosts: '',
          odometerIn: '',
          odometerOut: '',
          dateIn: new Date().toISOString().split('T')[0],
          dateOut: '',
          estimatedCompletionDate: '',
          notes: ''
        });
      } else {
        setErrorMessage(result.error || 'Failed to save repair order');
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
      }
    } catch (error) {
      console.error('Failed to submit repair order:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    return priorityLevels.find(p => p.value === priority)?.color || '#64748b';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  return (
    <div className="repair-order-container">
      <div className="repair-order-header">
        <h1>🔧 Repair Order Management</h1>
        <p>Truxo Transportation Management System</p>
      </div>

      {showSuccess && (
        <div className="success-banner">
          ✓ Repair order saved successfully!
        </div>
      )}

      {showError && (
        <div className="error-banner">
          ✗ {errorMessage}
        </div>
      )}

      <div className="repair-order-content">
        <form onSubmit={handleSubmit} className="repair-order-form">
          {/* Asset Information Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>🚛 Asset Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="assetNumber">Asset/Unit Number *</label>
                <input
                  type="text"
                  id="assetNumber"
                  name="assetNumber"
                  value={formData.assetNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., TRK-001"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="licensePlate">License Plate</label>
                <input
                  type="text"
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="e.g., ABC-1234"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vin">VIN</label>
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  placeholder="17-character VIN"
                  maxLength="17"
                />
              </div>
              <div className="form-group">
                <label htmlFor="make">Make</label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  placeholder="e.g., Freightliner"
                />
              </div>
              <div className="form-group">
                <label htmlFor="model">Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Cascadia"
                />
              </div>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="e.g., 2022"
                  min="1900"
                  max="2099"
                />
              </div>
            </div>
          </div>

          {/* Order Details Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>📋 Order Details</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="orderNumber">Order Number *</label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., RO-2024-001"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="orderDate">Order Date *</label>
                <input
                  type="date"
                  id="orderDate"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="priority">Priority Level *</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  style={{ borderLeft: `4px solid ${getPriorityColor(formData.priority)}` }}
                  required
                >
                  {priorityLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Repair Information Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>🔧 Repair Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="repairType">Type of Repair *</label>
                <select
                  id="repairType"
                  name="repairType"
                  value={formData.repairType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Repair Type --</option>
                  {repairTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {formData.repairType === 'Other' && (
                <div className="form-group full-width">
                  <label htmlFor="customRepairType">Specify Repair Type *</label>
                  <input
                    type="text"
                    id="customRepairType"
                    name="customRepairType"
                    value={formData.customRepairType}
                    onChange={handleInputChange}
                    placeholder="Enter custom repair type"
                    required
                  />
                </div>
              )}
              <div className="form-group full-width">
                <label htmlFor="description">Repair Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the issue and repair work needed..."
                  rows="4"
                  required
                />
              </div>
            </div>
          </div>

          {/* Service Provider Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>🏢 Service Provider</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="serviceProvider">Provider Name *</label>
                <input
                  type="text"
                  id="serviceProvider"
                  name="serviceProvider"
                  value={formData.serviceProvider}
                  onChange={handleInputChange}
                  placeholder="e.g., ABC Truck Repair"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="vendorContact">Contact Person</label>
                <input
                  type="text"
                  id="vendorContact"
                  name="vendorContact"
                  value={formData.vendorContact}
                  onChange={handleInputChange}
                  placeholder="Contact name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vendorPhone">Phone Number</label>
                <input
                  type="tel"
                  id="vendorPhone"
                  name="vendorPhone"
                  value={formData.vendorPhone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Cost Information Section */}
          <div className="form-section cost-section">
            <div className="section-header">
              <h2>💰 Cost Information</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="laborCost">Labor Cost</label>
                <div className="input-with-icon">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    id="laborCost"
                    name="laborCost"
                    value={formData.laborCost}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="partsCost">Parts Cost</label>
                <div className="input-with-icon">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    id="partsCost"
                    name="partsCost"
                    value={formData.partsCost}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="taxAmount">Tax Amount</label>
                <div className="input-with-icon">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    id="taxAmount"
                    name="taxAmount"
                    value={formData.taxAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="otherCosts">Other Costs</label>
                <div className="input-with-icon">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    id="otherCosts"
                    name="otherCosts"
                    value={formData.otherCosts}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="total-cost-display">
              <span className="total-label">Total Cost:</span>
              <span className="total-amount">{formatCurrency(calculateTotalCost())}</span>
            </div>
          </div>

          {/* Vehicle Condition Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>📊 Vehicle Condition & Timeline</h2>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="odometerIn">Odometer In (miles)</label>
                <input
                  type="number"
                  id="odometerIn"
                  name="odometerIn"
                  value={formData.odometerIn}
                  onChange={handleInputChange}
                  placeholder="e.g., 125000"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="odometerOut">Odometer Out (miles)</label>
                <input
                  type="number"
                  id="odometerOut"
                  name="odometerOut"
                  value={formData.odometerOut}
                  onChange={handleInputChange}
                  placeholder="e.g., 125050"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateIn">Date In *</label>
                <input
                  type="date"
                  id="dateIn"
                  name="dateIn"
                  value={formData.dateIn}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateOut">Date Out</label>
                <input
                  type="date"
                  id="dateOut"
                  name="dateOut"
                  value={formData.dateOut}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="estimatedCompletionDate">Est. Completion Date</label>
                <input
                  type="date"
                  id="estimatedCompletionDate"
                  name="estimatedCompletionDate"
                  value={formData.estimatedCompletionDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>📝 Additional Notes</h2>
            </div>
            <div className="form-group full-width">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional information, special instructions, or follow-up actions..."
                rows="4"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Save Repair Order'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()} disabled={loading}>
              🔄 Reset Form
            </button>
          </div>
        </form>

        {/* Recent Orders Sidebar */}
        {savedOrders.length > 0 && (
          <div className="recent-orders-sidebar">
            <h3>Recent Orders</h3>
            <div className="orders-list">
              {savedOrders.slice(0, 5).map((order, index) => (
                <div key={index} className="order-card">
                  <div className="order-header">
                    <span className="order-number">{order.orderNumber}</span>
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(order.priority) }}
                    >
                      {order.priority}
                    </span>
                  </div>
                  <div className="order-details">
                    <p><strong>Asset:</strong> {order.assetNumber}</p>
                    <p><strong>Type:</strong> {order.repairType}</p>
                    <p><strong>Total:</strong> {formatCurrency(order.totalCost)}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RepairOrder;
