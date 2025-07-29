import { Link } from "react-router-dom";

const Activity = ({ activity }) => {
  const {
    id,
    price,
    thumbnail_url,
    title,
    duration,
    max_participants,
    difficulty_level,
    description,
  } = activity;

  return (
    <div className="card animate-in">
      <div className="showcase-trek">
        <span className="read">from ${price}</span>
        <img src={thumbnail_url} className="card-img-top" alt={title} />
      </div>
      <div className="content text-center">
        <div className="row meta">
          <div className="col-md-4">
            <h5>{duration}</h5>
            <h6> Days</h6>
          </div>
          <div className="col-md-4">
            <h5>{max_participants}</h5>
            <h6> Max Group Size</h6>
          </div>
          <div className="col-md-4">
            <h5>{difficulty_level}</h5>
            <h6> Difficulty</h6>
          </div>
        </div>
        <div className="category">
          <h4 className="card-title activity-title">{title}</h4>
        </div>

        <p className="card-text">{description}</p>
        <Link to={`/activity/${id}`} className="btn btn-view-details">
          View Details
        </Link>
      </div>
    </div>
  );
};
export default Activity;
