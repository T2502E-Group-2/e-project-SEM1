import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

const AboutPage = () => {
  return (
    <div
      style={{ paddingTop: "160px", color: "white", fontFamily: "sans-serif" }}>
      {/* Hero Section */}
      <div className="about-hero-section">
        <Container className="text-center">
          <h1 className="display-3 fw-bold">About Us</h1>
          <p className="lead">Leaders in High Altitude Guiding</p>
        </Container>
      </div>

      <Container className="my-5">
        {/* Our Mission Section */}
        <Row className="text-center mt-5">
          <Col className="text-center">
            <h2 className="section-title">
              <span>Our Mission</span>
            </h2>
            <p className=" my-5 align-items-center bg-dark bg-opacity-50 p-5 rounded lead">
              For over 30 years, Alpine Ascents International has been a leader
              and innovator in the mountain guiding industry. We are dedicated
              to providing the highest quality of service and safety, ensuring
              that every climber has a life-changing experience. Our goal is to
              help you achieve your dreams, whether it's summiting a
              world-renowned peak or learning new skills on a local climb.
            </p>
          </Col>
        </Row>

        {/* Why Choose Us Section */}
        <Row className="mb-5 text-center">
          <Col>
            <h2 className="section-title">
              <span>Why Choose Us?</span>
            </h2>
          </Col>
        </Row>
        <Row>
          {/* Feature 1 */}
          <Col md={4} className="mb-4 d-flex">
            <Card
              className="feature-card shadow-sm w-100"
              style={{ height: "25vh" }}>
              <Card.Body className="d-flex flex-column">
                <Card.Title as="h4" className="mb-3">
                  World-Class Guides
                </Card.Title>
                <Card.Text
                  className="flex-grow-1"
                  style={{ overflow: "visible" }}>
                  Our guides are among the most experienced and qualified in the
                  world, with extensive training in safety, first aid, and
                  customer service.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          {/* Feature 2 */}
          <Col md={4} className="mb-4 d-flex">
            <Card
              className="feature-card shadow-sm w-100"
              style={{ height: "25vh" }}>
              <Card.Body className="d-flex flex-column">
                <Card.Title as="h4" className="mb-3">
                  Unparalleled Safety
                </Card.Title>
                <Card.Text
                  className="flex-grow-1"
                  style={{ overflow: "visible" }}>
                  Safety is our top priority. We maintain a low client-to-guide
                  ratio and use the best equipment to ensure your well-being on
                  the mountain.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          {/* Feature 3 */}
          <Col md={4} className="mb-4 d-flex">
            <Card
              className="feature-card shadow-sm w-100"
              style={{ height: "25vh" }}>
              <Card.Body className="d-flex flex-column">
                <Card.Title as="h4" className="mb-3">
                  Commitment to Success
                </Card.Title>
                <Card.Text
                  className="flex-grow-1"
                  style={{ overflow: "visible" }}>
                  We are committed to helping you succeed. Our high summit
                  success rates are a testament to our expert planning and
                  on-mountain support.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Our History Section */}
        <Row className="my-5 align-items-center bg-dark bg-opacity-50 p-5 rounded">
          <Col md={6}>
            <h3>Our History</h3>
            <p className="lead">
              Founded in 1986, Alpine Ascents International began with a simple
              mission: to offer climbers the best possible experience on the
              world's greatest mountains. From our early days on Mount Rainier
              to leading expeditions on all Seven Summits, we have consistently
              set the standard for excellence in guided climbing. Our history is
              built on a foundation of passion, perseverance, and a deep respect
              for the mountains we explore.
            </p>
          </Col>
        </Row>

        {/* Meet the Team Section */}
        <Row className="text-center mt-5">
          <Col>
            <h2 className="section-title">
              <span>Meet Our Guides</span>
            </h2>
            <p className="my-5 align-items-center bg-dark bg-opacity-50 p-5 rounded lead">
              The heart and soul of our company.
            </p>
          </Col>
        </Row>
        <Row>
          {/* Placeholder for Guide Cards - You can map through an array of guides here */}
          <Col md={4} className="mb-4">
            <Card className="text-center border-0">
              <Card.Img
                variant="top"
                src="https://www.ifpri.org/wp-content/uploads/2015/02/ulimwengu_john.jpg"
                className="rounded-circle w-50 mx-auto mt-3"
              />
              <Card.Body>
                <Card.Title>John Doe</Card.Title>
                <Card.Text className="text-muted">Lead Guide</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="text-center border-0">
              <Card.Img
                variant="top"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_12ffm1d7Z5lxa3xetJm2g1oU5_x9q1S26A&s"
                className="rounded-circle w-50 mx-auto mt-3"
              />
              <Card.Body>
                <Card.Title>Jane Smith</Card.Title>
                <Card.Text className="text-muted">Senior Guide</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="text-center border-0">
              <Card.Img
                variant="top"
                src="https://www.friedfrank.com/uploads/images/77ceffeddba2de3cb36ee4ada89d17e1.png"
                className="rounded-circle w-50 mx-auto mt-3"
              />
              <Card.Body>
                <Card.Title>Sam Wilson</Card.Title>
                <Card.Text className="text-muted">Everest Specialist</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutPage;
