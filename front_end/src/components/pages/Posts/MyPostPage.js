import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";
import AuthModal from "../../common/AuthModal";
import UserContext from "../../../context/context";

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

const MyPostsPage = () => {
  const { state } = useContext(UserContext);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login");
  const [showModal, setShowModal] = useState(false);

  const handleOpenAuthModal = (mode) => {
    setAuthMode(mode);
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  // Function to handle deleting a post
  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setLoading(true);
      const response = await axios_instance.delete(
        `${URL.DELETE_POST}/${postId}`
      );
      if (response.data?.status) {
        setError(null);
        setMyPosts((prevPosts) =>
          prevPosts.filter((post) => post.post_id !== postId)
        );
      } else {
        setError(response.data.message || "Could not delete the post.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred while deleting."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    //If not logged in, transfer to the homepage or login page
    if (!state.user) {
      setLoading(false); // tránh vòng loading xoay mãi
      return;
    }
    const controller = new AbortController();
    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios_instance.get(URL.GET_USER_POSTS, {
          signal: controller.signal,
        });
        if (response.data?.status) {
          setError(null);
          setMyPosts(
            Array.isArray(response.data.data) ? response.data.data : []
          );
        } else {
          setError(response.data.message || "An unknown error occurred.");
          setMyPosts([]);
        }
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError(err.response?.data?.message || "An error occurred.");
          setMyPosts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
    return () => {
      controller.abort();
    };
  }, [state.user]);

  const renderContent = () => {
    if (!state.user) {
      return (
        <div className="text-center">
          <Alert variant="warning">
            Please login to see your posts. If you do not have an account,
            register for sharing post function.
          </Alert>
          <Button
            variant="outline-light"
            style={{ marginRight: "10px" }}
            onClick={() => handleOpenAuthModal("login")}>
            Login
          </Button>
          <Button
            variant="outline-light"
            onClick={() => handleOpenAuthModal("register")}>
            Register
          </Button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center">
          <Spinner animation="border" variant="light" />
          <p style={{ color: "white" }}>Loading posts...</p>
        </div>
      );
    }

    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }

    if (myPosts.length === 0) {
      return (
        <div className="text-center">
          <Alert variant="info">
            You haven't written any posts yet. Do you want to share your first
            post?
          </Alert>
          <Button
            style={{ backgroundColor: "var(--primary-color)", border: "none" }}
            onClick={() => navigate("/posts/create")}>
            <i className="bi bi-plus-circle-fill me-2"></i>
            Share Your Post
          </Button>
        </div>
      );
    }
    return (
      <Row>
        {myPosts.map((post) => {
          const isOwner = state.user && post.author_id === state.user.user_id;
          return (
            <Col key={post.post_id} md={4} className="mb-4">
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
                    className="card-img-top"
                    onError={(e) => (e.target.src = "/default-thumbnail.jpg")}
                  />
                  <Card.Body className="p-1">
                    <Card.Title className="card-title">{post.title}</Card.Title>
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
                            ? "var(--primary-color)"
                            : "#6c757d",
                        fontSize: "0.75em",
                      }}>
                      {post.status}
                    </span>
                  </Card.Body>
                </Link>
                {isOwner && (
                  <Card.Footer className="mt-auto bg-transparent border-0 p-1">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => navigate(`/posts/edit/${post.post_id}`)}
                      style={{
                        marginRight: "5px",
                        zIndex: 10,
                      }}>
                      <i className="bi bi-pencil-square"></i> Edit
                    </Button>
                    <Button
                      variant="btn"
                      style={{
                        backgroundColor: "var(--primary-color)",
                        outlineColor: "var(--primary-color)",
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
    );
  };

  return (
    <>
      <Container style={{ paddingTop: "160px" }}>
        <h1
          className="mb-4 text-center"
          style={{ color: "#ffff", textShadow: "1px 1px 2px black" }}>
          My Posts
        </h1>
        {renderContent()}
      </Container>
      <AuthModal
        show={showModal}
        onClose={handleCloseModal}
        mode={authMode}
        setAuthMode={setAuthMode}
      />
    </>
  );
};

export default MyPostsPage;
