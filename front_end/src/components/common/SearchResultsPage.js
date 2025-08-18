import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Col, Container, Row, Spinner, Alert } from "react-bootstrap";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import Activity from "../../components/shared/Activity";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${URL.SEARCH_ACTIVITIES}?search=${encodeURIComponent(
          query
        )}`;
        const response = await axios_instance.get(url);
        if (response.data.status && response.data.data) {
          setActivities(response.data.data);
        } else {
          setError(response.data.message || "Can not get search results.");
        }
      } catch (err) {
        setError("Error occurred when searching. Please try again.");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const renderContent = () => {
    if (loading) {
      return <Spinner animation="border" />;
    }
    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }
    if (activities.length === 0) {
      return <Alert variant="info">No result available "{query}".</Alert>;
    }
    return (
      <Row>
        {activities.map((activity) => (
          <Col
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={activity.activity_id}
            className="mb-4">
            <Activity activity={activity} />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Container style={{ paddingTop: "160px", paddingBottom: "50px" }}>
      <h1
        className="mb-4"
        style={{ color: "white", textShadow: "1px 1px 2px #000" }}>
        Search results for: "{query}"
      </h1>
      {renderContent()}
    </Container>
  );
};

export default SearchResultsPage;
