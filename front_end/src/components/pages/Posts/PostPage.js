import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const PostPage = () => {
  const { state } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios_instance.get(URL.ALL_POST);
        if (response.data?.status && Array.isArray(response.data.data)) {
          setPosts(response.data.data);
        } else {
          setPosts([]);
          setError("Invalid response format from server.");
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Could not load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle delete post
  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await axios_instance.delete(
        `${URL.POST_ACTIONS}?id=${postId}`
      );
      if (response.data.success) {
        alert("Post deleted successfully!");
        // Update UI by deleting posts from State
        setPosts((currentPosts) =>
          currentPosts.filter((p) => p.post_id !== postId)
        );
      } else {
        alert(`Error: ${response.data.error || "Could not delete post."}`);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("An error occurred while deleting the post.");
    }
  };

  if (loading) {
    return (
      <Container
        className="text-center mt-5 vh-100"
        style={{ paddingTop: "100px" }}>
        <Spinner animation="border" variant="primary" />
        <p>Loading Posts...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5" style={{ paddingTop: "100px" }}>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (posts.length === 0) {
    return (
      <Container className="mt-5" style={{ paddingTop: "100px" }}>
        <Alert variant="info">No posts found.</Alert>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="post-page-wrapper">
      {state.user && (
        <Container className="mb-4">
          <Button
            style={{ backgroundColor: "darkorange", border: "none" }}
            onClick={() => navigate("/create-post")}
            variant="success">
            Share Your Post with Us
          </Button>
        </Container>
      )}

      <Container fluid>
        <Row className="g-4">
          {posts.map((post) => {
            // Check the ownership of the user
            const isOwner = state.user && state.user.user_id === post.author_id;

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
                    className="post-link">
                    <Card.Img
                      variant="top"
                      src={post.thumbnail_url}
                      alt={post.title}
                      onError={(e) => (e.target.src = "/default-thumbnail.jpg")}
                    />
                    <Card.Body className="p-1">
                      <Card.Title className="card-title">
                        {post.title}
                      </Card.Title>
                      <Card.Text className="text-muted small">
                        By {post.author_name || "Unknown"} on{" "}
                        {formatDate(post.created_at)}
                      </Card.Text>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: "8px",
                          color:
                            post.status === "published"
                              ? "darkorange"
                              : "#6c757d",
                          fontSize: "0.75em",
                        }}>
                        {post.status}
                      </span>
                    </Card.Body>
                  </Link>

                  {/* Show Edit/Delete buttons if the owner -> */}
                  {isOwner && (
                    <Card.Footer className="mt-auto bg-transparent border-0 p-1">
                      {isOwner && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() =>
                            navigate(`/posts/edit/${post.post_id}`)
                          }
                          style={{
                            marginRight: "5px",
                            zIndex: 10,
                          }}>
                          <i className="bi bi-pencil-square"></i> Edit
                        </Button>
                      )}
                      <Button
                        variant="btn"
                        style={{
                          backgroundColor: "darkorange",
                          outlineColor: "darkorange",
                          color: "#fff",
                        }}
                        size="sm"
                        onClick={() => handleDelete(post.post_id)}>
                        Delete
                      </Button>
                    </Card.Footer>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default PostPage;
