import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios_instance from "../../../util/axios_instance";
import { Container, Spinner, Alert, Card } from "react-bootstrap";
import URL from "../../../util/url";

const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios_instance.get(`${URL.POST_DETAIL}${id}`);
        if (response.data?.status) {
          setPost(response.data.data);
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
  }, [id]);

  if (loading)
    return (
      <div className="post-detail-page-wrapper d-flex justify-content-center align-items-center">
        <Spinner animation="border" />
      </div>
    );
  if (error)
    return (
      <div className="post-detail-page-wrapper">
        <Container className="pt-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </div>
    );
  if (!post) return null;

  return (
    <div>
      <Card className="post-detail-page-wrapper ">
        <h2>{post.title}</h2>
        <p className="text-muted">
          By {post.author_name} - {post.created_at}
        </p>
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </Card>
    </div>
  );
};

export default PostDetailPage;
