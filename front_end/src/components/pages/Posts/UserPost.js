import React, { useState, useContext } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";
import PostEditor from "../../common/PostEditor";
import UserContext from "../../../context/context";

const UserPost = () => {
  const { state } = useContext(UserContext); // Get information user login
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("12"); // default = Blog
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const isEmptyHtml = (html) =>
    !html || html.replace(/<[^>]*>/g, "").replace(/&nbsp;|\s/g, "") === "";

  const handleSubmit = async (e) => {
    e.preventDefault();

    //Check if user logged in
    if (!state.user) {
      setError("You must be logged in to create a post.");
      return;
    }

    if (!title.trim() || isEmptyHtml(content)) {
      setError("Please enter the full title and content.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await axios_instance.post(URL.CREATE_POST, {
        title,
        content,
        thumbnail_url: thumbnail,
        post_category_id: parseInt(category, 10),
      });
      // Check if the response is successful
      if (res.status === 201) {
        setSuccess(
          res.data?.message || "The article has been successfully posted!"
        );
        setTimeout(() => navigate("/posts"), 1500);
      } else {
        // Fallback for the case that the server does not return 201 but still succeed
        setError(
          res.data?.message ||
            "An unexpected response was received from the server."
        );
      }
    } catch (err) {
      console.error("Failed to post article:", err);

      if (err.response) {
        // Error from the server (Server returned the response)
        const serverMessage =
          err.response.data?.message || "An error occurred on the server.";
        switch (err.response.status) {
          case 400:
            setError(`Bad Request: ${serverMessage}`);
            break;
          case 401:
            setError(`Unauthorized: ${serverMessage}. Please log in again.`);
            break;
          default:
            setError(serverMessage); // Error 500 or other errors
            break;
        }
      } else if (err.request) {
        // Request was sent but no response was received
        setError(
          "Could not connect to the server. Please check your network connection."
        );
      } else {
        // Error occurred while setting up the request
        setError("An error occurred while preparing the request.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid style={{ paddingTop: "200px" }}>
      <h2 className="mb-4">Create Your Post</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={4}>
            <Card className="p-3 mb-3">
              <Form.Group className="mb-3" controlId="title">
                <Form.Label>Post Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="thumbnail">
                <Form.Label>Thumbnail URL</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter image URL"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}>
                  <option value="8">News</option>
                  <option value="9">Success Story</option>
                  <option value="10">Record</option>
                  <option value="11">Review</option>
                  <option value="12">Blog</option>
                </Form.Select>
              </Form.Group>

              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  "Submit Post"
                )}
              </Button>
            </Card>
          </Col>

          <Col md={8}>
            <Card className="p-3 mb-3">
              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <PostEditor value={content} onChange={setContent} />
              </Form.Group>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default UserPost;
