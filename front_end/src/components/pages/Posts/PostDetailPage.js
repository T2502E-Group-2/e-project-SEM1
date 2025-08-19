import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios_instance from "../../../util/axios_instance";
import {
  Container,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  Button,
  ListGroup,
} from "react-bootstrap";
import URL from "../../../util/url";
import UserContext from "../../../context/context";

const PostDetailPage = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const { state } = useContext(UserContext);
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

  if (!post) return null;

  // === DEBUGGING BLOCK ===
  console.log("--- Check ownership ---");
  console.log("User login (state.user):", state.user);
  console.log("Post (post):", post);

  if (state.user && post) {
    console.log(
      "ID người dùng:",
      state.user.user_id,
      "| Kiểu dữ liệu:",
      typeof state.user.user_id
    );
    console.log(
      "ID tác giả bài viết:",
      post.author_id,
      "| Kiểu dữ liệu:",
      typeof post.author_id
    );
    console.log("So sánh (===):", state.user.user_id === post.author_id);
  }
  console.log("---------------------------------");
  // ===============================================================

  const isOwner = state.user && state.user.user_id === post.author_id;

  return (
    <Container
      className="container-fluid post-detail-page-wrapper"
      style={{ paddingTop: "160px" }}>
      <Row className="justify-content-center ">
        {/* Main content */}
        <Col md={8}>
          <Card className="mb-4 shadow-sm position-relative">
            {isOwner && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate(`/posts/edit/${post.post_id}`)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 10,
                }}>
                <i className="bi bi-pencil-square"></i> Edit
              </Button>
            )}
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
          <h4
            className="mb-3 text-center"
            style={{
              color: "#ffff",
              fontWeight: "bold",
              textShadow: "1px 1px 2px #000",
            }}>
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
          </ListGroup>{" "}
          <div className="text-center">
            {state.user && (
              <Container className="mt-3">
                <Button
                  style={{ backgroundColor: "darkorange", border: "none" }}
                  onClick={() => navigate("/posts/create")}
                  variant="success">
                  <i className="bi bi-plus-circle-fill me-2"></i>
                  Share Your Post
                </Button>
              </Container>
            )}
          </div>
        </Col>
        <Col
          md={8}
          className="container-fluid d-flex mt-4"
          style={{
            color: "#ffff",
            fontSize: "1.2rem",
            textShadow: "1px 1px 2px #000",
          }}>
          {post.prev_post ? (
            <Col
              md={6}
              className="text-start"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/posts/${post.prev_post.post_id}/${post.prev_post.slug}`
                )
              }>
              <span className="text">
                <i className="bi bi-chevron-left"></i> {post.prev_post.title}
              </span>
            </Col>
          ) : (
            <div></div>
          )}
          {post.next_post ? (
            <Col
              md={6}
              className="text-end"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/posts/${post.next_post.post_id}/${post.next_post.slug}`
                )
              }>
              <span className="text">
                {" "}
                {post.next_post.title} <i className="bi bi-chevron-right"></i>
              </span>
            </Col>
          ) : (
            <div></div>
          )}
        </Col>
        <Col md={4}></Col>
      </Row>
    </Container>
  );
};

export default PostDetailPage;
