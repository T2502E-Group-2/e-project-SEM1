import { Link } from "react-router-dom";

const Activity = ({ activity }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };
  return (
    <div className="card">
      <img
        src={activity.thumbnail_url}
        className="card-img-top"
        alt={activity.title}
      />
      <div className="card-body">
        <h4
          className="card-title"
          style={{
            fontWeight: "bold",
            fontFamily: "Palatino Linotype, serif",
            color: "darkorange",
          }}>
          {activity.title}
        </h4>
        <p className="card-text">
          <strong>Start date:</strong> {formatDate(activity.start_date)}
        </p>
        <p className="card-text">
          <strong>End date:</strong> {formatDate(activity.end_date)}
        </p>
        <p className="card-text">
          <strong>Registration deadline:</strong>{" "}
          {formatDate(activity.enrollment_deadline)}
        </p>
        <p className="card-text">
          {" "}
          <strong>Fee: </strong>${activity.price}
        </p>
        <Link
          to={"/detail/" + activity.activity_id}
          className="btn btn-primary mt-auto">
          More Info
        </Link>
      </div>
    </div>
  );
};
export default Activity;
