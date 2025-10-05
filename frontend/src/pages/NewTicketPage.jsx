import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../services/api';
import '../styles/Forms.css';

function NewTicketPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createTicket(formData);
      navigate('/tickets');
    } catch (err) {
      setError(err.error?.message || 'Failed to create ticket.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Create New Ticket</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              backgroundColor: '#242424',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px',
            }}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              backgroundColor: '#242424',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px',
            }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <button type="submit" className="form-button" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Ticket'}
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}

export default NewTicketPage;
