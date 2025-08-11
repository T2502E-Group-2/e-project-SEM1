import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import Activity from "../shared/Activity";
import ReusableSlider from "../shared/ReusableSlider";
import BannerSlider from "../common/Banner_slider";

const Home = () => {
  const [featuredActivities, setFeaturedActivities] = useState([]);
  const [latestActivities, setLatestActivities] = useState([]);

  useEffect(() => {
    // get data featured activities
    const get_featured = async () => {
      const url = URL.FEATURED_ACTIVITIES;
      const rs = await axios_instance.get(url);
      setFeaturedActivities(rs.data.data);
    };
    // get data latest activities
    const get_latest = async () => {
      const url = URL.LATEST_ACTIVITIES;
      const rs = await axios_instance.get(url);
      setLatestActivities(rs.data.data);
    };
    get_featured();
    get_latest();
  }, []);

  return (
    <>
      <BannerSlider />
      <Container fluid className="topic-card">
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
      </Container>
    </>
  );
};

export default Home;
