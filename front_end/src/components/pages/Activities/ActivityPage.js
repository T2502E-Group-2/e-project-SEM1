import React, { useEffect, useState } from "react";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";
import Activity from "../../shared/Activity"; // Đã có sẵn file này

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios_instance.get(URL.FEATURED_ACTIVITIES);
        setActivities(response.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load activities.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading activities...</div>;
  if (error) return <div className="text-center text-danger mt-5">{error}</div>;

  return (
    <div className="container">
      <h1 className="text-center mt-5 mb-4">Our Adventures</h1>
      <div className="row g-4">
        {activities.map((activity) => (
          <div key={activity.id} className="col-md-6 col-lg-4">
            <Activity activity={activity} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityPage;
