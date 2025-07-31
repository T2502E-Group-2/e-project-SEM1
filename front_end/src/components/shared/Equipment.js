// import { Link } from "react-router-dom";

const Equipment = ({ equipment }) => {
  // Add a guard clause to prevent crashes if the equipment prop is not provided.
  if (!equipment) {
    return null;
  }

  const { name, price, image_url, brand } = equipment;

  return (
    <div className="card product-card animate-in py-3 bg-white shadow-sm">
      <div className="showcase-trek">
        <img src={image_url} className="card-img-top" alt={name} />
      </div>
      <div className="content text-center">
        <div className="category">
          <h4 className="card-title activity-title mb-0">{name}</h4>
        </div>
        <p className="card-text mb-0">{brand}</p>
        <span className="card-text mt-0">
          <strong>${price || "N/A"}</strong>
        </span>
        {/* <Link to={`/equipment/${id}`} className="btn btn-view-details">
          Details
        </Link> */}
      </div>
    </div>
  );
};

export default Equipment;
