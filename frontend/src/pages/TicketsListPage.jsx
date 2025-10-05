import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../services/api';
import TicketItem from '../components/TicketItem';
import '../styles/Tickets.css';

function TicketsListPage() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const data = await getTickets();
        setTickets(data.items);
      } catch (err) {
        setError(err.error?.message || 'Failed to fetch tickets.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <p>Loading tickets...</p>;
    }
    if (error) {
      return <p style={{ color: '#ff6b6b' }}>Error: {error}</p>;
    }
    if (tickets.length === 0) {
      return <p>No tickets found. Create one!</p>;
    }
    return (
      <div>
        {tickets.map((ticket) => (
          <TicketItem key={ticket._id} ticket={ticket} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="tickets-header">
        <h1>All Tickets</h1>
        <Link to="/tickets/new" className="new-ticket-button">
          Create New Ticket
        </Link>
      </div>
      {renderContent()}
    </div>
  );
}

export default TicketsListPage;
