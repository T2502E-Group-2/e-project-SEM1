import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";
import Equipment from "../../shared/Equipment";
import Slider from "react-slick";
import PaginationComponent from "../../common/Pagination";
import FilterSidebar from "../../common/Filter_Sidebar";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const EquipmentPage = () => {
  const [featuredEquipments, setFeaturedEquipments] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const featuredRef = useRef(null);
  const allEquipmentsRef = useRef(null);
  const featuredTitleRef = useRef(null);
  const allTitleRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryIdFromUrl = queryParams.get("category_id");
  const [filters, setFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    category_id: [],
    sub_category: [],
  });
  useEffect(() => {
    if (categoryIdFromUrl) {
      const idAsString = categoryIdFromUrl.toString();
      setFilters((prev) => ({
        ...prev,
        category_id: idAsString,
      }));
      setSelectedFilters((prev) => ({
        ...prev,
        category_id: [idAsString],
      }));
      setCurrentPage(1);
    }
  }, [categoryIdFromUrl]);

  useEffect(() => {
    if (categoryIdFromUrl) {
      const idAsString = categoryIdFromUrl.toString();

      setFilters((prev) => ({
        ...prev,
        category_id: idAsString,
      }));

      setSelectedFilters((prev) => ({
        ...prev,
        category_id: [idAsString],
      }));

      setCurrentPage(1);
    }
  }, [categoryIdFromUrl]);

  const itemsPerPage = 12;

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
  }, [featuredEquipments, equipments]);

  // Fetch featured equipments (Only run 1 time)
  useEffect(() => {
    const getFeatured = async () => {
      try {
        const url = URL.FEATURED_EQUIPMENTS;
        const rs = await axios_instance.get(url);
        setFeaturedEquipments(rs.data.data || []);
      } catch (err) {
        console.error("Failed to fetch featured equipments:", err);
      }
    };
    getFeatured();
  }, []);

  // Fetch paginated equipments (Run every time curlentpage changes)
  useEffect(() => {
    const fetchEquipmentsByPage = async () => {
      setLoading(true);
      setError(null);
      console.log("filters:", filters);
      console.log("Fetching URL:", URL.ALL_EQUIPMENTS);
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
        });

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== "") {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                params.append(key, value[0]);
              }
            } else {
              params.append(key, value);
            }
          }
        });

        const url = `${URL.ALL_EQUIPMENTS}?${params.toString()}`;
        const rs = await axios_instance.get(url);

        // Update State from API data returned
        setEquipments(rs.data.data || []);
        setTotalPages(rs.data.totalPages || 0);
      } catch (err) {
        console.error("Failed to fetch equipments:", err);
        setError("Could not load equipments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEquipmentsByPage();
  }, [currentPage, filters]);
  console.log("Fetching URL:", URL.ALL_EQUIPMENTS);

  // Scroll to the top of the equipment list when the page changes
  useEffect(() => {
    if (allEquipmentsRef.current) {
      allEquipmentsRef.current.scrollIntoView({ behavior: "smooth" });
    }
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

  if (loading && equipments.length === 0) {
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
  const currentEquipments = equipments.filter(
    (equipment) => equipment && equipment.id != null
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    } else {
      console.warn(`Invalid page number: ${pageNumber}. Not updating.`);
    }
  };

  const handleFilterChange = (newFilters, rawState) => {
    setCurrentPage(1);
    setFilters(newFilters);
    setSelectedFilters(rawState);
  };

  return (
    <Container fluid className="topic-card" style={{ paddingTop: "120px" }}>
      <Row>
        <Col lg={2} md={12} className="mb-4 sidebar-filter">
          <FilterSidebar
            onFilterChange={handleFilterChange}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
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
          <div ref={allEquipmentsRef} style={{ position: "relative" }}>
            {loading && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 10,
                }}>
                <Spinner animation="border" size="sm" />
              </div>
            )}
            <Row
              style={{
                opacity: loading ? 0.5 : 1,
                transition: "opacity 0.3s ease",
              }}>
              {currentEquipments.length > 0 ? (
                currentEquipments.map((equipment) => (
                  <Col
                    key={equipment.id}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    className="mb-2 slider-item">
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

          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default EquipmentPage;
