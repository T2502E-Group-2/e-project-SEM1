import React, { useState, useEffect, useContext } from "react";
// Import các component cần thiết giống như PostPage.js
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
import UserContext from "../../../context/context";

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
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

  // Function to handle deleting a post
  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setLoading(true);
      const response = await axios_instance.delete(
        `${URL.DELETE_POST}/${postId}`
      );
      if (response.data?.status) {
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
    // Nếu chưa đăng nhập, chuyển về trang chủ hoặc trang đăng nhập
    if (!state.user) {
      navigate("/login");
      return;
    }

    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        // Gọi đến API mới để lấy bài viết của tôi
        const response = await axios_instance.get(URL.GET_USER_POSTS);
        if (response.data?.status) {
          setMyPosts(response.data.data);
        } else {
          setError(response.data.message || "Could not fetch your posts.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [state.user, navigate]);

  if (loading) return <Spinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container style={{ paddingTop: "160px" }}>
      <h1
        className="mb-4 text-center"
        style={{ color: "#ffff", textShadow: "1px 1px 2px black" }}>
        My Posts
      </h1>
      {myPosts.length > 0 ? (
        <Row>
          {/* Lặp qua và hiển thị các bài viết của bạn, có thể tái sử dụng component Card từ PostPage */}
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
      ) : (
        <Alert variant="info">You haven't written any posts yet.</Alert>
      )}
    </Container>
  );
};

export default MyPostsPage;
