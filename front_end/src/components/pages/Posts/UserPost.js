import React, { useState, useContext, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";
import PostEditor from "../../common/PostEditor";
import UserContext from "../../../context/context";

const UserPost = () => {
  const { postId } = useParams(); //Get post_id from the URL, it will be undefined if it is a new creation page
  const isEditMode = Boolean(postId); // Determine whether the edit is not

  const { state } = useContext(UserContext); // Get information user login
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("12"); // default = Blog
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isEmptyHtml = (html) =>
    !html || html.replace(/<[^>]*>/g, "").replace(/&nbsp;|\s/g, "") === "";

  useEffect(() => {
    if (isEditMode) {
      // Nếu là mode edit, fetch dữ liệu bài viết
      const fetchPostData = async () => {
        try {
          const res = await axios_instance.get(
            `${URL.POST_ACTIONS}?id=${postId}`
          );
          const postData = res.data;
          // Điền dữ liệu vào form
          setTitle(postData.title);
          setContent(postData.content);
          setThumbnail(postData.thumbnail_url);
          setCategory(postData.post_category_id);
        } catch (err) {
          console.error("Failed to fetch post data:", err);
          setError("Could not load post data for editing.");
        }
      };
      fetchPostData();
    }
  }, [postId, isEditMode]);

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

    const postData = {
      title,
      content,
      thumbnail_url: thumbnail,
      post_category_id: parseInt(category, 10),
    };

    try {
      let res;
      if (isEditMode) {
        res = await axios_instance.post(URL.POST_ACTIONS, {
          ...postData,
          post_id: postId,
        });
      } else {
        res = await axios_instance.post(URL.CREATE_POST, postData);
      }
      // Check if the response is successful
      setSuccess(res.data?.message || "Action completed successfully!");
      setTimeout(() => navigate("/posts"), 1500);
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
      <h2
        className="mb-4 text-center"
        style={{ color: "#ffff", textShadow: "1px 1px 2px black" }}>
        {isEditMode ? "Edit Your Post" : "Create Your Post"}
      </h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={4}>
            <Card className="p-3 mb-3">
              <Form.Group className="mb-3" controlId="title">
                <Form.Label>
                  <b>Post Title</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="thumbnail">
                <Form.Label>
                  <b>Thumbnail URL</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter image URL"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="category">
                <Form.Label>
                  <b>Category</b>
                </Form.Label>
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
                <Form.Label>
                  <b>Content</b>
                </Form.Label>
                <PostEditor value={content} onChange={setContent} />
              </Form.Group>
            </Card>
          </Col>
        </Row>
      </Form>
      {/* <Button type="submit" variant="primary" disabled={loading}>
        {loading ? (
          <Spinner size="sm" animation="border" />
        ) : isEditMode ? (
          "Update Post"
        ) : (
          "Submit Post"
        )}
      </Button> */}
    </Container>
  );
};

export default UserPost;
