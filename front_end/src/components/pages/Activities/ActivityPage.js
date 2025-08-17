import React, { useEffect, useState, useRef } from "react";
import { Row, Col } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";
import Activity from "../../shared/Activity";
import ReusableSlider from "../../shared/ReusableSlider";

const ActivityPage = () => {
  const [allActivities, setAllActivities] = useState([]);
  const [featuredActivities, setFeaturedActivities] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allActivitiesRef = useRef(null);
  const allActivitiesTitleRef = useRef(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryId = params.get("category_id");

  const useAnimateOnScroll = (refs) => {
    useEffect(() => {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains("topic-card-text")) {
              entry.target.classList.add("animate-in");
            } else {
              const sliderItems = entry.target.querySelectorAll(".slider-item");
              sliderItems.forEach((item, index) => {
                setTimeout(() => {
                  item.classList.add("animate-in");
                }, index * 100);
              });
            }
          }
        });
      }, observerOptions);

      refs.forEach((ref) => {
        if (ref.current) observer.observe(ref.current);
      });

      return () => observer.disconnect();
    }, [refs]);
  };

  useAnimateOnScroll([allActivitiesRef, allActivitiesTitleRef]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const [allRes, featuredRes, latestRes] = await Promise.all([
          axios_instance.get(
            categoryId
              ? `${URL.ALL_ACTIVITIES}?category_id=${categoryId}`
              : URL.ALL_ACTIVITIES
          ),
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
  }, [categoryId]);

  if (loading)
    return <div className="text-center mt-5">Loading activities...</div>;
  if (error) return <div className="text-center text-danger mt-5">{error}</div>;

  return (
    <div className="container-fluid" style={{ paddingTop: "200px" }}>
      <Row>
        {/* Main Content: All Activities */}
        <Col lg={12}>
          <div
            className="text-center mb-4"
            style={{
              color: "#fff",
              textShadow: "2px 2px 8px rgba(0, 0, 0, 1)",
            }}>
            <h2 style={{ fontSize: "2.5rem" }}>Explore The Great Outdoors</h2>
            <p
              className="text-center"
              style={{
                color: "#fff",
                fontSize: "1.5rem",
                textShadow: "2px 2px 8px rgba(0, 0, 0, 1)",
              }}>
              Join us on an unforgettable adventure. We offer a wide range of
              activities for every level of experience.
            </p>
          </div>
          <div className="row row-cols-1 row-cols-md-4 g-4 mb-2">
            {allActivities.map((activity) => (
              <div key={activity.activity_id} className="col">
                <Activity activity={activity} />
              </div>
            ))}
          </div>
        </Col>

        {/* Use ReusableSlider for Featured and Latest Activities */}
        <Col lg={12}>
          <ReusableSlider
            title="Featured Activities"
            data={featuredActivities}
            renderItem={(activity) => <Activity activity={activity} />}
          />
          <ReusableSlider
            title="Latest Activities"
            data={latestActivities}
            renderItem={(activity) => <Activity activity={activity} />}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ActivityPage;
