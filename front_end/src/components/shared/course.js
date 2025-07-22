import { Link } from "react-router-dom";

const Course = ({ course }) => {
  return (
    <div className="card">
      <img src={course.thumbnail} className="card-img-top" alt="..." />
      <div className="card-body">
        <h5 className="card-title">{course.name}</h5>
        <p className="card-text">${course.price}</p>
        <Link to={"/detail/" + course.id} className="btn btn-primary">
          Detail
        </Link>
      </div>
    </div>
  );
};
export default Course;
