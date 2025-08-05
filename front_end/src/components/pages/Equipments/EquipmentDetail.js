import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";

import {
  Col,
  Container,
  Row,
  Button,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";

const EquipmentDetail = () => {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const get_detail = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = URL.EQUIPMENT_DETAIL + id;
        const rs = await axios_instance.get(url);
        if (rs.data && rs.data.data) {
          setEquipment(rs.data.data);
          console.log(rs.data.data);
        } else {
          setError("Equipment not found.");
        }
      } catch (err) {
        setError("Could not fetch equipment details. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    get_detail();
  }, [id]);

  if (loading) {
    return (
      <Container
        className="text-center mt-5 vh-100"
        style={{ paddingTop: "140px" }}
      >
        <Spinner animation="border" variant="primary" />
        <p>Loading Equipment Details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5" style={{ paddingTop: "140px" }}>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!equipment) {
    return null; // or a "not found" message
  }

  return (
    <Container style={{ paddingTop: "200px", paddingBottom: "50px" }}>
      <Row className="bg-white p-3 rounded">
        <Row>
          <Col md={4}>
            <img
              className="img-thumbnail mx-3 my-3 border-0"
              style={{ width: "300px", cursor: "pointer" }}
              src={equipment.image_url}
              alt={equipment.name}
              onClick={() => setShowModal(true)}
            />
          </Col>

          <Col md={8} className="mt-2 px-5">
            <div className="mt-3">
              <h1>
                <strong>{equipment.name}</strong>
              </h1>
              <h5 className="text-secondary">{equipment.brand}</h5>
              <h3 className="text-primary">
                <strong>${equipment.price}</strong>
              </h3>
            </div>
          </Col>
        </Row>
        <div className="lead mt-3">
          <strong className="fw-bold">Descriptions:</strong>
          <div
            className="mt-2"
            dangerouslySetInnerHTML={{ __html: equipment.description }}
          />
        </div>
        {equipment.purchase_link && (
          <Button
            className="mt-3"
            variant="btn btn-outline-primary btn-sm"
            href={equipment.purchase_link}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
          >
            Purchase Link
          </Button>
        )}
      </Row>
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Body className="p-0">
          <img
            src={equipment.image_url}
            alt={equipment.name}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              borderRadius: "10px",
            }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default EquipmentDetail;
