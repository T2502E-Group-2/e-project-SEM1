import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  ButtonGroup,
} from "react-bootstrap";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";
import UserContext from "../../../context/context";

// Tách hàm tiện ích ra ngoài component để tránh việc bị tạo lại mỗi lần render
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const PostPage = () => {
  const { state } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [pageTitle, setPageTitle] = useState("All Posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      const requestUrl = categoryId
        ? `${URL.ALL_POST}?category=${categoryId}`
        : URL.ALL_POST;

      try {
        const response = await axios_instance.get(requestUrl);
        if (response.data?.status && Array.isArray(response.data.data)) {
          setPosts(response.data.data);
          if (response.data.category_info) {
            setPageTitle(
              `Category: ${response.data.category_info.category_name}`
            );
          } else {
            setPageTitle("All Posts");
          }
        } else {
          // Xử lý trường hợp API trả về status: true nhưng data không phải mảng
          setPosts([]);
          console.warn("API response data is not an array:", response.data);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError(
          err.response?.data?.message ||
            "Could not load posts. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [categoryId]);

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      // Sử dụng URL.POST_ACTIONS thay vì URL.USER_POST_ACTIONS để nhất quán
      const response = await axios_instance.delete(
        `${URL.POST_ACTIONS}?id=${postId}`
      );
      if (response.data.success) {
        alert("Post deleted successfully!");
        setPosts((currentPosts) =>
          currentPosts.filter((p) => p.post_id !== postId)
        );
      } else {
        alert(`Error: ${response.data.error || "Could not delete post."}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert(
        err.response?.data?.error ||
          "An error occurred while deleting the post."
      );
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Container
          className="text-center"
          style={{
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading Posts...</p>
        </Container>
      );
    }

    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }

    if (posts.length === 0) {
      return <Alert variant="info">No posts found in this section.</Alert>;
    }

    return (
      <Row className="g-4">
        {posts.map((post) => {
          const isOwner =
            state.user && Number(state.user.user_id) === Number(post.author_id);

          return (
            <Col
              key={post.post_id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className="d-flex">
              <Card
                className="post-card border-0 h-100 d-flex flex-column"
                title={post.title}>
                <Link
                  to={`/posts/${post.post_id}/${post.slug}`}
                  className="post-link text-decoration-none">
                  <Card.Img
                    variant="top"
                    src={post.thumbnail_url}
                    alt={post.title}
                    className="card-img-top-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-thumbnail.jpg";
                    }}
                  />
                  <Card.Body className="p-2">
                    <Card.Title className="card-title h6">
                      {post.title}
                    </Card.Title>
                    <Card.Text className="text-muted small mb-0">
                      By {post.author_name || "Unknown"}
                    </Card.Text>
                    <Card.Text className="text-muted small">
                      {formatDate(post.created_at)}
                    </Card.Text>
                  </Card.Body>
                </Link>

                {isOwner && (
                  <Card.Footer className="mt-auto bg-transparent border-0 p-2">
                    <ButtonGroup className="w-100">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate(`/posts/edit/${post.post_id}`)}>
                        <i className="bi bi-pencil-square"></i> Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(post.post_id)}>
                        <i className="bi bi-trash"></i> Delete
                      </Button>
                    </ButtonGroup>
                  </Card.Footer>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <div
      className="post-page-wrapper"
      style={{ paddingTop: "200px", paddingBottom: "50px" }}>
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1
            className="text-center"
            style={{
              color: "#ffff",
              fontWeight: "bold",
              textShadow: "1px 1px 2px #000",
            }}>
            {pageTitle}
          </h1>
          {state.user && (
            <Button
              style={{ backgroundColor: "darkorange", border: "none" }}
              onClick={() => navigate("/posts/create")}
              variant="success">
              <i className="bi bi-plus-circle-fill me-2"></i>
              Share Your Post
            </Button>
          )}
        </div>
        {renderContent()}
      </Container>
    </div>
  );
};

export default PostPage;
