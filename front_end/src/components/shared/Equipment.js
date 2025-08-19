import { Link } from "react-router-dom";

const Equipment = ({ equipment }) => {
  if (!equipment) {
    return null;
  }

  const { id, name, price, stock, image_url, brand, category_name } = equipment;

  return (
    <Link to={`/equipment/${id}`} className="product-link">
      <div
        className="card product-card animate-in pt-3 bg-white shadow-lg h-100"
        title={name}>
        <div className="showcase-trek">
          <img src={image_url} className="card-img-top" alt={name} />
        </div>
        <div className="content text-center">
          <div className="category">
            <h4
              className="card-title activity-title mb-0"
              style={{ fontSize: "1.5rem" }}>
              {name}
            </h4>
          </div>
          <p className="card-text mb-1">Stock: {stock}</p>
          <p className="text-muted small mb-1">
            {category_name && `Category: ${category_name}`}
          </p>
          <p className="card-text mb-1">{brand}</p>
          <span className="card-text mt-0 mb-0">
            <strong>${price || "N/A"}</strong>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Equipment;
