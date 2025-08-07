import React, { useEffect, useState } from "react";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";
import Activity from "../../shared/Activity"; // Đã có sẵn file này
import "./ActivitiesPage.css"; // Đường dẫn tùy theo cấu trúc dự án

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

  if (loading)
    return <div className="text-center mt-5">Loading activities...</div>;
  if (error) return <div className="text-center text-danger mt-5">{error}</div>;

  return (
    <div className="container">
      <div style={{ paddingTop: "140px" }}></div>
      <h1 className="text-center mt-5 mb-4">Our Adventures</h1>
      <div className="row g-4">
        {activities.map((activity) => (
          <div key={activity.id} className="col-12 col-md-6 col-lg-4">
            <div className="container">
              {/* THÊM NỘI DUNG MỚI VÀO ĐÂY */}
              <div className="text-center mt-5 mb-4" style={{ color: "#fff" }}>
                <h2 style={{ fontSize: "2.5rem" }}>
                  Explore The Great Outdoors
                </h2>
                <p className="lead" style={{ fontSize: "1.5rem" }}>
                  Join us on an unforgettable adventure. We offer a wide range
                  of activities for every level of experience.
                </p>
              </div>
              {/* KẾT THÚC NỘI DUNG MỚI */}
              <h1 className="text-center mt-5 mb-4">Our Adventures</h1>
              <div className="row g-4 d-flex align-items-stretch">
                {activities.map((activity) => (
                  <div key={activity.id} className="text-center mt-5 mb-4">
                    <Activity activity={activity} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityPage;
