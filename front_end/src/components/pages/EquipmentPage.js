import { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import Equipment from "../shared/Equipment"; // Component để hiển thị một equipment
import Slider from "react-slick";

// Import CSS cho slick-carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Equipments = () => {
  const [featuredEquipments, setFeaturedEquipments] = useState([]);
  const [allEquipments, setAllEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy dữ liệu featured và all equipments song song
        const [featuredRes, allRes] = await Promise.all([
          axios_instance.get(URL.FEATURED_EQUIPMENTS),
          axios_instance.get(URL.ALL_EQUIPMENTS),
        ]);

        setFeaturedEquipments(featuredRes.data.data || []);
        setAllEquipments(allRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch equipments:", err);
        setError("Could not load equipments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipments();
  }, []);

  // Cài đặt cho Slider
  const sliderSettings = {
    dots: true,
    infinite: featuredEquipments.length > 3,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <Container className="text-center mt-5 vh-100">
        <Spinner animation="border" variant="primary" />
        <p>Loading Equipments...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Lọc ra các thiết bị không có ID hợp lệ để tránh lỗi "key" và giúp debug.
  const validFeaturedEquipments = featuredEquipments.filter((equipment) => {
    const isValid = equipment && equipment.id != null;
    if (!isValid) {
      console.warn(
        "Dữ liệu thiết bị nổi bật không hợp lệ (thiếu ID):",
        equipment
      );
    }
    return isValid;
  });

  const validAllEquipments = allEquipments.filter((equipment) => {
    const isValid = equipment && equipment.id != null;
    if (!isValid) {
      console.warn("Dữ liệu thiết bị không hợp lệ (thiếu ID):", equipment);
    }
    return isValid;
  });

  return (
    <Container fluid className="py-5">
      {/* Featured Equipments Section */}
      {validFeaturedEquipments.length > 0 && (
        <Container className="mb-5">
          <h2 className="text-center mb-4">Featured Equipments</h2>
          <Slider {...sliderSettings}>
            {validFeaturedEquipments.map((equipment) => (
              <div key={equipment.id} className="p-2">
                <Equipment equipment={equipment} />
              </div>
            ))}
          </Slider>
        </Container>
      )}

      {/* All Equipments Section */}
      <Container>
        <h2 className="text-center mb-4">All Equipments</h2>
        <Row>
          {validAllEquipments.length > 0 ? (
            validAllEquipments.map((equipment) => (
              <Col
                key={equipment.id}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="mb-4"
              >
                <Equipment equipment={equipment} />
              </Col>
            ))
          ) : (
            <Col>
              <Alert variant="info">No equipments found.</Alert>
            </Col>
          )}
        </Row>
      </Container>
    </Container>
  );
};

export default Equipments;
