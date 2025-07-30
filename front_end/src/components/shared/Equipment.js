import { Link } from "react-router-dom";
import { Card, Button } from "react-bootstrap";

const Equipment = ({ equipment }) => {
  const { id, name, price, image_url, description } = equipment;

  return (
    <Card className="h-100 shadow-sm">
      <Card.Img variant="top" src={image_url || 'https://via.placeholder.com/300x200'} alt={name} />
      <Card.Body className="d-flex flex-column">
        <Card.Title>{name}</Card.Title>
        <Card.Text className="text-muted flex-grow-1">
          {description ? `${description.substring(0, 100)}...` : 'No description available.'}
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span className="h5 mb-0">${price}</span>
          <Link to={`/equipment/${id}`}>
            <Button variant="primary">View Details</Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Equipment;
