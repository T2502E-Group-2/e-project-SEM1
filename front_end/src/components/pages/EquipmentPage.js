import { useEffect, useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Pagination,
} from "react-bootstrap";
import axios_instance from "../../util/axios_instance";
import URL from "../../util/url";
import Equipment from "../shared/Equipment";
import Slider from "react-slick";
import FilterSidebar from "../common/Filter_Sidebar";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const EquipmentPage = () => {
  const [featuredEquipments, setFeaturedEquipments] = useState([]);
  const [allEquipments, setAllEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const featuredRef = useRef(null);
  const allEquipmentsRef = useRef(null);
  const featuredTitleRef = useRef(null);
  const allTitleRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch featured equipments
  const getFeatured = async () => {
    try {
      const url = URL.FEATURED_EQUIPMENTS;
      const rs = await axios_instance.get(url);
      setFeaturedEquipments(rs.data.data || []);
    } catch (err) {
      console.error("Failed to fetch featured equipments:", err);
      throw err;
    }
  };

  // Fetch all equipments
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

  // Animation observer setup
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

  // Log the initial data after fetching to confirm it's stored
  useEffect(() => {
    console.log(
      "Initial fetch complete. allEquipments.length:",
      allEquipments.length
    );
  }, [allEquipments]);

  // Scroll to the top of the equipment list when the page changes
  useEffect(() => {
    if (allEquipmentsRef.current) {
      allEquipmentsRef.current.scrollIntoView({ behavior: "smooth" });
    }
    console.log(`Scrolled to top for page ${currentPage}`);
  }, [currentPage]);

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
      { breakpoint: 1400, settings: { slidesToShow: 1, slidesToScroll: 1 } },
      { breakpoint: 992, settings: { slidesToShow: 1, slidesToScroll: 1 } },
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

  const validFeaturedEquipments = featuredEquipments.filter(
    (equipment) => equipment && equipment.id != null
  );
  const validAllEquipments = allEquipments.filter(
    (equipment) => equipment && equipment.id != null
  );

  const totalPages = Math.ceil(validAllEquipments.length / itemsPerPage);

  // Pagination logic with a fail-safe check
  let currentEquipments = [];
  if (validAllEquipments.length > 0) {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    currentEquipments = validAllEquipments.slice(
      indexOfFirstItem,
      indexOfLastItem
    );
  }

  console.log(
    `Render complete. currentPage: ${currentPage}, Items on page: ${currentEquipments.length}`
  );

  const handlePageChange = (pageNumber) => {
    console.log(`Attempting to change to page: ${pageNumber}`);
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      console.log(`Successfully changed to page: ${pageNumber}`);
    } else {
      console.warn(`Invalid page number: ${pageNumber}. Not updating.`);
    }
  };

  return (
    <Container fluid className="topic-card" style={{ paddingTop: "182px" }}>
      <Row>
        <Col lg={2} md={12} className="mb-4 sidebar-filter">
          <FilterSidebar />
        </Col>
        <Col lg={10}>
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

          <h2 ref={allTitleRef} className="mt-5 topic-card-text">
            All Equipments
          </h2>
          <div ref={allEquipmentsRef}>
            <Row>
              {currentEquipments.length > 0 ? (
                currentEquipments.map((equipment) => (
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
                  <Alert variant="info">
                    No equipments found on this page.
                  </Alert>
                </Col>
              )}
            </Row>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EquipmentPage;
