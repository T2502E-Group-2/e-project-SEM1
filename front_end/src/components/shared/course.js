import { Link } from "react-router-dom";

const Course = ({ course }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN"); // Format date to Vietnamese locale
  };
  return (
    <div className="card">
      <img src={course.thumbnail_url} class="card-img-top" alt={course.title} />
      <div className="card-body">
        <h4
          className="card-title"
          style={{
            fontWeight: "bold",
            fontFamily: "Palatino Linotype, serif",
            color: "darkorange",
          }}>
          {course.title}
        </h4>
        <p className="card-text mb-1">
          <strong>Start date:</strong> {formatDate(course.start_date)}
        </p>
        <p className="card-text mb-1">
          <strong>End date:</strong> {formatDate(course.end_date)}
        </p>
        <p className="card-text mb-3">
          <strong>Registration deadline:</strong>{" "}
          {formatDate(course.enrollment_deadline)}
        </p>
        <p className="card-text">${course.price}</p>
        <Link
          to={"/detail/" + course.course_id}
          className="btn btn-primary mt-auto">
          Detail
        </Link>
      </div>
    </div>
  );
};
export default Course;
