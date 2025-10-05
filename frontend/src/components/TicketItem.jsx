import '../styles/Tickets.css';
import { useNavigate } from 'react-router-dom';

function TicketItem({ ticket }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tickets/${ticket._id}`);
  };

  const statusColor = {
    new: '#535bf2',
    in_progress: '#f2a553',
    resolved: '#53f28a',
  };

  return (
    <div
      className="ticket-item"
      style={{ borderLeftColor: statusColor[ticket.status] || '#535bf2' }}
      onClick={handleClick}
    >
      <div className="ticket-item-header">
        <h3 className="ticket-title">{ticket.title}</h3>
        <span className="ticket-meta">
          Created: {new Date(ticket.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="ticket-meta">
        Status:{' '}
        <span className="ticket-status">{ticket.status.replace('_', ' ')}</span>{' '}
        | Priority: <span className="ticket-status">{ticket.priority}</span>
      </p>
    </div>
  );
}

export default TicketItem;
