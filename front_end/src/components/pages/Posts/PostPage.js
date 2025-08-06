import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";

const PostPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // const featuredPost = posts[0];
  // const otherPosts = posts.slice(1);

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
      <Container fluid>
        <Row className="g-4">
          {posts.map((post) => (
            <Col
              key={post.post_id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className="mb-4">
              <div className="w-100">
                <Card
                  className="post-card border-0  h-100 container-fluid flex-column"
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
                    <Card.Body>
                      <Card.Title className="card-title">
                        {post.title}
                      </Card.Title>
                      <Card.Text className="text-muted small">
                        By {post.author_name || "Unknown"} on{" "}
                        {formatDate(post.created_at)}
                      </Card.Text>
                      {typeof post.excerpt === "string" ? (
                        <div
                          className="excerpt-text small card-text"
                          dangerouslySetInnerHTML={{ __html: post.excerpt }}
                        />
                      ) : (
                        <p className="excerpt-text small card-text">
                          No excerpt available.
                        </p>
                      )}
                    </Card.Body>
                  </Link>
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default PostPage;
