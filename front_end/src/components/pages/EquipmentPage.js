import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import Equipment from "../shared/Equipment";
import Slider from "react-slick";
import FilterSidebar from "../common/Filter_Sidebar";

// Import CSS cho slick-carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const EquipmentPage = () => {
  const [featuredEquipments, setFeaturedEquipments] = useState([]);
  const [allEquipments, setAllEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs for animation
  const featuredRef = useRef(null);
  const allEquipmentsRef = useRef(null);
  const featuredTitleRef = useRef(null);
  const allTitleRef = useRef(null);

  // Get featured equipments
  const getFeatured = async () => {
    try {
      const url = URL.FEATURED_EQUIPMENTS;
      const rs = await axios_instance.get(url);
      const data = rs.data.data || [];
      setFeaturedEquipments(data);
    } catch (err) {
      console.error("Failed to fetch featured equipments:", err);
      throw err;
    }
  };

  // Get all equipments
  const getAllEquipments = async () => {
    try {
      const url = URL.ALL_EQUIPMENTS;
      const rs = await axios_instance.get(url);
      const data = rs.data.data || [];
      setAllEquipments(data);
    } catch (err) {
      console.error("Failed to fetch all equipments:", err);
      throw err;
    }
  };

  // Animation observer setup (similar to Home.js)
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains("topic-card-text")) {
            entry.target.classList.add("animate-in");
          } else {
            // Animate slider items with staggered delay
            const sliderItems = entry.target.querySelectorAll(".slider-item");
            sliderItems.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add("animate-in");
              }, index * 100);
            });
          }
        }
      });
    }, observerOptions);

    // Observe elements
    if (featuredTitleRef.current) observer.observe(featuredTitleRef.current);
    if (allTitleRef.current) observer.observe(allTitleRef.current);
    if (featuredRef.current) observer.observe(featuredRef.current);
    if (allEquipmentsRef.current) observer.observe(allEquipmentsRef.current);

    return () => observer.disconnect();
  }, [featuredEquipments, allEquipments]);

  // Fetch data on component mount
  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both featured and all equipments in parallel
        await Promise.all([getFeatured(), getAllEquipments()]);
      } catch (err) {
        console.error("Failed to fetch equipments:", err);
        setError("Could not load equipments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipments();
  }, []);

  // Slider settings (similar to Home.js)
  const sliderSettings = {
    className: "center-slider",
    centerMode: true,
    dots: true,
    infinite: featuredEquipments.length > 2,
    speed: 200,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
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

  // Filter valid equipments (similar to original but cleaner)
  const validFeaturedEquipments = featuredEquipments.filter((equipment) => {
    const isValid = equipment && equipment.id != null;
    if (!isValid) {
      console.warn("Invalid featured equipment data (missing ID):", equipment);
    }
    return isValid;
  });

  const validAllEquipments = allEquipments.filter((equipment) => {
    const isValid = equipment && equipment.id != null;
    if (!isValid) {
      console.warn("Invalid equipment data (missing ID):", equipment);
    }
    return isValid;
  });

  return (
    <Container fluid className="topic-card" style={{ paddingTop: "182px" }}>
      <Row>
        {/* SIDEBAR */}
        <Col lg={2} md={12} className="mb-4 sidebar-filter">
          <FilterSidebar />
        </Col>

        {/* Product Area */}
        <Col lg={10}>
          {/* Featured Equipments */}
          {validFeaturedEquipments.length > 0 && (
            <>
              <h2 ref={featuredTitleRef} className="mt-4 topic-card-text">
                Featured Equipments
              </h2>
              <div ref={featuredRef}>
                <Slider {...sliderSettings}>
                  {validFeaturedEquipments.map((equipment) => (
                    <div className="slider-item" key={equipment.id}>
                      <Equipment equipment={equipment} />
                    </div>
                  ))}
                </Slider>
              </div>
            </>
          )}

          {/* All Equipments */}
          <h2 ref={allTitleRef} className="mt-5 topic-card-text">
            All Equipments
          </h2>
          <div ref={allEquipmentsRef}>
            <Row>
              {validAllEquipments.length > 0 ? (
                validAllEquipments.map((equipment) => (
                  <Col
                    key={equipment.id}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    className="mb-4 slider-item">
                    <Equipment equipment={equipment} />
                  </Col>
                ))
              ) : (
                <Col>
                  <Alert variant="info">No equipments found.</Alert>
                </Col>
              )}
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default EquipmentPage;
