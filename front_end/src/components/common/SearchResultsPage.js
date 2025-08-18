import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  CardGroup,
  Image,
} from "react-bootstrap";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [groupedResults, setGroupedResults] = useState({}); // State mới để chứa kết quả đã nhóm
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect để lấy dữ liệu
  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${URL.SEARCH}?q=${encodeURIComponent(query)}`;
        const response = await axios_instance.get(url);
        setResults(response.data);
      } catch (err) {
        setError("An error occurred while searching. Please try again.");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [query]);

  // useEffect để nhóm kết quả sau khi lấy dữ liệu xong
  useEffect(() => {
    const grouped = results.reduce((acc, item) => {
      const key = item.type;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
    setGroupedResults(grouped);
  }, [results]);

  const getResultUrl = (item) => {
    // ... (hàm này giữ nguyên như cũ)
    switch (item.type) {
      case "activity":
        return `/activities/${item.id}`;
      case "equipment":
        return `/equipment/${item.id}`;
      case "post":
        return `/posts/${item.id}/${item.slug}`;
      default:
        return "/";
    }
  };

  const createSnippet = (text) => {
    if (!text) return "";
    const plainText = text.replace(/<[^>]+>/g, "");
    return plainText.length > 200
      ? `${plainText.substring(0, 200)}...`
      : plainText;
  };

  // Hàm render nội dung chính
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center">
          <Spinner animation="border" variant="light" />
        </div>
      );
    }
    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }
    if (Object.keys(groupedResults).length === 0) {
      return <Alert variant="info">No results found for "{query}".</Alert>;
    }

    // Render theo từng nhóm
    return (
      <CardGroup
        className="flex-column"
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}>
        {Object.entries(groupedResults).map(([type, items]) => (
          <div key={type} className="mb-3">
            <h2
              className="text-capitalize border-bottom border-secondary pb-2 mb-3"
              style={{ color: "darkorange", fontWeight: "bold" }}>
              {type}
            </h2>
            {items.map((item, index) => (
              <div
                key={`${item.type}-${item.id}`}
                className="search-result-row"
                onClick={() => navigate(getResultUrl(item))}>
                <Row className="g-3 align-items-center">
                  <Col xs={12} md={5} lg={4}>
                    <Image
                      src={item.image_url || "/no-image-icon.png"}
                      thumbnail
                      className="w-100"
                    />
                  </Col>
                  <Col xs={12} md={7} lg={8}>
                    <h5 className="mb-1 text-light">{item.title}</h5>
                    <p className="text-muted mb-2">
                      {createSnippet(item.description)}
                    </p>
                    <Link
                      to={getResultUrl(item)}
                      className="btn btn-view-details"
                      onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click của div cha
                    >
                      View Details
                    </Link>
                  </Col>
                </Row>
                {/* Dòng kẻ ngăn cách */}
                {index < items.length - 1 && (
                  <hr
                    style={{ borderColor: "#666", opacity: 0.5 }}
                    className="my-3"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </CardGroup>
    );
  };

  return (
    <>
      <style type="text/css">
        {`
          .search-result-row {
            cursor: pointer;
            padding: 1rem 0.5rem;
            transition: background-color 0.2s ease-in-out;
            border-radius: 8px;
          }
          .search-result-row:hover {
            background-color: rgba(255, 255, 255, 0.05);
          }
        `}
      </style>
      <Container
        style={{
          paddingTop: "160px",
          paddingBottom: "50px",
          minHeight: "100vh",
        }}>
        <h1
          className="mb-4"
          style={{ color: "white", textShadow: "1px 1px 2px #000" }}>
          Search Results for: "{query}"
        </h1>
        {renderContent()}
      </Container>
    </>
  );
};

export default SearchResultsPage;
