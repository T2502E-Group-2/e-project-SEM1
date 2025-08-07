import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios_instance from "../../../util/axios_instance";
import {
  Container,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  ListGroup,
} from "react-bootstrap";
import URL from "../../../util/url";

const PostDetailPage = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch post detail + validate slug
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios_instance.get(`${URL.POST_DETAIL}${id}`);
        if (response.data?.status) {
          setPost(response.data.data);

          // redirect nếu slug sai
          if (response.data.data.slug !== slug) {
            navigate(`/posts/${id}/${response.data.data.slug}`, {
              replace: true,
            });
          }
        } else {
          setError("Post not found.");
        }
      } catch (err) {
        setError("Server error.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, slug, navigate]);

  // Fetch related/featured posts (mock data hoặc API)
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await axios_instance.get(URL.ALL_POST);
        if (res.data?.status && Array.isArray(res.data.data)) {
          const filtered = res.data.data
            .filter((p) => p.post_id !== Number(id))
            .slice(0, 5);
          setRelatedPosts(filtered);
        }
      } catch (e) {
        console.error("Failed to fetch related posts");
      }
    };
    fetchRelated();
  }, [id]);

  if (loading)
    return (
      <Container className="pt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );

  if (error)
    return (
      <Container className="pt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  if (!post) return null;

  return (
    <Container
      className="post-detail-page-wrapper"
      style={{ paddingTop: "200px" }}>
      <Row className="justify-content-center">
        {/* Main content */}
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h2>{post.title}</h2>
              <p className="text-muted">
                By {post.author_name} - {post.created_at}
              </p>
              <div
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col md={4}>
          <h4 className="mb-3" style={{ color: "#ffff", fontWeight: "bold" }}>
            Related Posts
          </h4>
          <ListGroup>
            {relatedPosts.map((item) => (
              <ListGroup.Item
                action
                key={item.post_id}
                onClick={() => navigate(`/posts/${item.post_id}/${item.slug}`)}>
                <strong>{item.title}</strong>
                <br />
                <small className="text-muted">{item.author_name}</small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <div className="d-flex justify-content-between mt-4">
          {post.prev_post ? (
            <div
              className="text-start"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/posts/${post.prev_post.post_id}/${post.prev_post.slug}`
                )
              }>
              <span className="text-primary">
                <i className="bi bi-chevron-left"></i> {post.prev_post.title}
              </span>
            </div>
          ) : (
            <div></div>
          )}
          {post.next_post ? (
            <div
              className="text-end"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/posts/${post.next_post.post_id}/${post.next_post.slug}`
                )
              }>
              <span className="text-primary">
                {post.next_post.title} <i className="bi bi-chevron-right"></i>
              </span>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </Row>
    </Container>
  );
};

export default PostDetailPage;
