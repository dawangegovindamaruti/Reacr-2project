import { useState } from 'react';
import './ProductAdmin.css';

export default function ProductAdmin() {
  const [formData, setFormData] = useState({
    image: '',
    name: '',
    stars: 4,
    count: 0,
    priceCents: '',
    keywords: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validate required fields
      if (!formData.image || !formData.name || !formData.priceCents || !formData.keywords) {
        setMessageType('error');
        setMessage('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Parse keywords from comma-separated string to array
      const keywordsArray = formData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (keywordsArray.length === 0) {
        setMessageType('error');
        setMessage('Please add at least one keyword');
        setLoading(false);
        return;
      }

      // Prepare payload
      const payload = {
        image: formData.image,
        name: formData.name,
        rating: {
          stars: parseFloat(formData.stars),
          count: parseInt(formData.count)
        },
        priceCents: parseInt(formData.priceCents),
        keywords: keywordsArray
      };

      // Send to backend
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage(`✓ Product "${formData.name}" created successfully!`);
        // Reset form
        setFormData({
          image: '',
          name: '',
          stars: 4,
          count: 0,
          priceCents: '',
          keywords: ''
        });
      } else {
        setMessageType('error');
        setMessage(`✗ Error: ${data.error}`);
      }
    } catch (error) {
      setMessageType('error');
      setMessage(`✗ Failed to create product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-admin-container">
      <div className="product-admin">
        <h1>Create New Product</h1>
        
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="image">Product Image Path *</label>
            <input
              type="text"
              id="image"
              name="image"
              placeholder="e.g., images/products/product-name.jpg"
              value={formData.image}
              onChange={handleChange}
              required
            />
            <small>Path should be relative to public folder</small>
          </div>

          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g., Athletic Running Shoes"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stars">Rating (Stars)</label>
              <input
                type="number"
                id="stars"
                name="stars"
                min="0"
                max="5"
                step="0.5"
                value={formData.stars}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="count">Review Count</label>
              <input
                type="number"
                id="count"
                name="count"
                min="0"
                value={formData.count}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="priceCents">Price (in cents) *</label>
            <input
              type="number"
              id="priceCents"
              name="priceCents"
              placeholder="e.g., 9999 (for $99.99)"
              value={formData.priceCents}
              onChange={handleChange}
              required
            />
            <small>Enter price in cents (e.g., $99.99 = 9999)</small>
          </div>

          <div className="form-group">
            <label htmlFor="keywords">Keywords (comma-separated) *</label>
            <textarea
              id="keywords"
              name="keywords"
              placeholder="e.g., shoes, sports, athletic, apparel"
              value={formData.keywords}
              onChange={handleChange}
              rows="3"
              required
            />
            <small>Separate keywords with commas for product search</small>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>

        <div className="instructions">
          <h3>Instructions:</h3>
          <ol>
            <li>Fill in all required fields (marked with *)</li>
            <li>Price should be entered in cents (e.g., $99.99 = 9999)</li>
            <li>Keywords help customers find your product via search</li>
            <li>Product image should be placed in the public/images/products/ folder</li>
            <li>Click "Create Product" to save to database</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
