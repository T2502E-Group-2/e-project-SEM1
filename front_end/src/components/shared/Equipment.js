import { Link } from "react-router-dom";
import { Card, Button } from "react-bootstrap";

const Equipment = ({ equipment }) => {
  // Add a guard clause to prevent crashes if the equipment prop is not provided.
  if (!equipment) {
    return null;
  }

  const { id, name, price, image_url, description } = equipment;

  return (
    <Card className="h-100 shadow-sm">
      <Card.Img
        variant="top"
        src={image_url || "https://via.placeholder.com/300x200"}
        alt={name}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title>{name}</Card.Title>
        <Card.Text className="text-muted flex-grow-1">
          {description && description.length > 100
            ? `${description.substring(0, 100)}...`
            : description || "No description available."}
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span className="h5 mb-0">${price != null ? price : "N/A"}</span>
          <Button as={Link} to={`/equipment/${id}`} variant="primary">
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Equipment;
