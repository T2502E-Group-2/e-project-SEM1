import React, { useEffect, useState } from "react";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";
import Activity from "../../shared/Activity"; // Đã có sẵn file này

const ActivityPage = () => {
  const [allActivities, setAllActivities] = useState([]);
  const [featuredActivities, setFeaturedActivities] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const [allRes, featuredRes, latestRes] = await Promise.all([
          axios_instance.get(URL.ALL_ACTIVITIES),
          axios_instance.get(URL.FEATURED_ACTIVITIES),
          axios_instance.get(URL.LATEST_ACTIVITIES),
        ]);

        setAllActivities(allRes.data.data || []);
        setFeaturedActivities(featuredRes.data.data || []);
        setLatestActivities(latestRes.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load activities.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading)
    return <div className="text-center mt-5">Loading activities...</div>;
  if (error) return <div className="text-center text-danger mt-5">{error}</div>;

  const renderTable = (activities) => (
    <div className="table-responsive">
      <table className="table table-striped">
        <thead className="text-center align-content-center justify-content-center">
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Max Participants</th>
            <th>Price</th>
            <th>
              Duration <br /> (days)
            </th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.activity_id}>
              <td>{activity.title}</td>
              <td>{activity.description}</td>
              <td>{activity.max_participant}</td>
              <td>{activity.price}</td>
              <td>{activity.duration}</td>
              <td>{activity.start_date}</td>
              <td>{activity.end_date}</td>
              <td>{activity.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container-fluid" style={{ paddingTop: "200px" }}>
      <h1 className="text-center mb-4">Our Adventures</h1>
      <div className="row">
        {/* Main Content: All Activities */}
        <div className="col-lg-12">
          <div className="text-center mb-4" style={{ color: "#fff" }}>
            <h2 style={{ fontSize: "2.5rem" }}>Explore The Great Outdoors</h2>
            <p className="lead" style={{ fontSize: "1.5rem" }}>
              Join us on an unforgettable adventure. We offer a wide range of
              activities for every level of experience.
            </p>
          </div>
          <div className="row row-cols-1 row-cols-md-3 g-4 mb-5">
            {allActivities.map((activity) => (
              <div key={activity.activity_id} className="col">
                <Activity activity={activity} />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Featured and Latest Activities */}
        <div className="col-lg-12">
          <div className="bg-light p-3 rounded shadow-sm mb-5">
            <h4 className="mb-3">Featured Activities</h4>
            {renderTable(featuredActivities)}
          </div>
          <div className="bg-light p-3 rounded shadow-sm mt-4">
            <h4 className="mb-3">Latest Activities</h4>
            {renderTable(latestActivities)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
