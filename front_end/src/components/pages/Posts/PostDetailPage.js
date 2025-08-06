import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios_instance from "../../../util/axios_instance";
import { Container, Spinner, Alert, Card } from "react-bootstrap";
import URL from "../../../util/url";

const PostDetailPage = () => {
  const { id, slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios_instance.get(`${URL.POST_DETAIL}${id}`);
        if (response.data?.status) {
          setPost(response.data.data);
        } else {
          setError("Post not found.");
        }
        if (response.data.data.slug !== slug) {
          navigate(`/posts/${id}/${response.data.data.slug}`, {
            replace: true,
          });
        }
      } catch (err) {
        setError("Server error.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading)
    return (
      <div className="">
        <Spinner animation=" post-detail-page-wrapper border d-flex justify-content-center align-items-center" />
      </div>
    );
  if (error)
    return (
      <div className="">
        <Container className="post-detail-page-wrapper pt-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </div>
    );
  if (!post) return null;

  return (
    <div>
      <div style={{ paddingTop: "200px" }}></div>
      <Card className="post-detail-page-wrapper ">
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
    </div>
  );
};

export default PostDetailPage;
