import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTicketById, addComment } from '../services/api';
import { useAuthStore } from '../store/authStore';
import '../styles/TicketDetail.css';
import '../styles/Forms.css';

function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        const data = await getTicketById(id);
        setTicket(data);
      } catch (err) {
        setError(err.error?.message || 'Failed to fetch ticket.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const addedComment = await addComment(id, { text: newComment });
      setTicket((prevTicket) => ({
        ...prevTicket,
        comments: [...prevTicket.comments, addedComment],
      }));
      setNewComment('');
    } catch (err) {
      alert('Failed to add comment.');
    }
  };

  if (isLoading) return <p>Loading ticket details...</p>;
  if (error) return <p style={{ color: '#ff6b6b' }}>Error: {error}</p>;
  if (!ticket) return <p>Ticket not found.</p>;

  return (
    <div className="ticket-detail-container">
      <div className="ticket-detail-card">
        <div className="detail-header">
          <h1>{ticket.title}</h1>
          <div className="detail-meta">
            <span>Created by: {ticket.createdBy.username}</span>
            <span>
              Created at: {new Date(ticket.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        <p className="detail-description">{ticket.description}</p>
        <p>
          Status: <strong>{ticket.status}</strong> | Priority:{' '}
          <strong>{ticket.priority}</strong>
        </p>
      </div>

      <div className="comments-section">
        <h2>Comments ({ticket.comments.length})</h2>
        {ticket.comments.map((comment) => (
          <div key={comment._id} className="comment">
            <p>
              <span className="comment-author">{comment.author.username}</span>
              <span className="comment-meta">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </p>
            <p>{comment.text}</p>
          </div>
        ))}

        <form
          onSubmit={handleCommentSubmit}
          className="form-container"
          style={{ maxWidth: '100%', padding: 0, marginTop: '2rem' }}
        >
          <div className="form-group">
            <textarea
              rows="4"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                backgroundColor: '#2f2f2f',
                color: '#fff',
                border: '1px solid #555',
                borderRadius: '4px',
              }}
              required
            />
          </div>
          <button
            type="submit"
            className="form-button"
            style={{ width: 'auto', padding: '0.6rem 1.5rem' }}
          >
            Add Comment
          </button>
        </form>
      </div>
    </div>
  );
}

export default TicketDetailPage;
