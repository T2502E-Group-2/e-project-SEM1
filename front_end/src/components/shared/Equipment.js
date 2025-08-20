import { Link } from "react-router-dom";
import { Card } from "react-bootstrap";

const Equipment = ({ equipment }) => {
  if (!equipment) {
    return null;
  }

  const { id, name, price, stock, image_url, brand, category_name } = equipment;

  return (
    <Link to={`/equipment/${id}`} className="product-link">
      <Card className="product-card h-100 shadow-sm" title={name}>
        <Link to={`/equipment/${id}`} className="product-link">
          <Card.Img
            variant="top"
            src={image_url}
            alt={name}
            className="card-img-top"
          />
        </Link>
        <Card.Body className="d-flex flex-column text-center">
          <div className="category">
            <Card.Title
              className="activity-title mb-0"
              style={{ fontSize: "1.5rem" }}>
              {name}
            </Card.Title>
          </div>
          <Card.Text className="mb-1">Stock: {stock}</Card.Text>
          <p className="text-muted small mb-1">
            {category_name && `Category: ${category_name}`}
          </p>
          <p className="card-text mb-1">{brand}</p>
          <div
            className="mt-auto"
            style={{
              fontSize: "1.2rem",
              color: "var(--primary-color)",
              fontFamily: "var(--font-secondary)",
              fontWeight: "bolder",
            }}>
            <span className="fw-bold">${price || "N/A"}</span>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default Equipment;
