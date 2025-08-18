import React, { useState, useEffect, useCallback } from "react";
import axios_instance from "../../../util/axios_instance";
import URL from "../../../util/url";
import PaginationComponent from "../../common/Pagination";

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  //Albums State
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  //Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // State for lightbox (photo view)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // === DATA FETCHING ===
  //Fetch Albums
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios_instance.get(URL.GET_ALBUMS); // Gọi API mới
        if (response.data && response.data.status) {
          setAlbums(response.data.data);
        }
      } catch (e) {
        console.error("Failed to fetch albums:", e);
      }
    };
    fetchAlbums();
  }, []);

  //Fetch Images
  useEffect(() => {
    setIsLoading(true);
    const fetchImages = async () => {
      let apiUrl = `${URL.GALLERIES}?page=${currentPage}&limit=24`;
      if (selectedAlbum) {
        apiUrl += `&album=${selectedAlbum}`;
      }
      try {
        const response = await axios_instance.get(apiUrl);
        const result = response.data;
        if (result && result.status) {
          setImages(result.data.images);
          setTotalPages(result.data.totalPages);
          setCurrentPage(result.data.currentPage);
        } else {
          throw new Error(
            result.message || "Failed to fetch images due to API error."
          );
        }
      } catch (e) {
        setError(e.message);
        console.error("Fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [currentPage, selectedAlbum]);

  // === ALBUMS HANDLERS ===
  const handleAlbumClick = (albumName) => {
    setSelectedAlbum(albumName);
    setCurrentPage(1);
  };

  //===PAGINATIONCOMPONENT HANDLERS ===
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // === LIGHTBOX HANDLERS ===
  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  }, [images.length]);

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  // === KEYBOARD NAVIGATION ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrevious();
    };

    if (isLightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    // Cleanup Function: Remove the event listener when component unmount or lightbox closed
    // Extremely important to avoid Memory Leak.
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, goToNext, goToPrevious, closeLightbox]);

  const capitalizeWords = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // === RENDER LOGIC ===
  if (isLoading) {
    return <div className="gallery-status">Download photo library...</div>;
  }

  if (error) {
    return <div className="gallery-status error">Error: {error}</div>;
  }

  return (
    <div className="gallery-page">
      <div className="album-browser">
        <h2
          style={{
            color: "#ffff",
            textShadow: "2px 2px 8px #000",
            paddingTop: "10px",
          }}>
          Browse by Album
        </h2>
        <div className="album-tags">
          {/* All albums Button" */}
          <button
            className={`album-tag ${!selectedAlbum ? "active" : ""}`}
            onClick={() => handleAlbumClick(null)}>
            All Photos
          </button>
          {/* Render albums from state */}
          {albums.map((album) => (
            <button
              key={album.album}
              className={`album-tag ${
                selectedAlbum === album.album ? "active" : ""
              }`}
              onClick={() => handleAlbumClick(album.album)}>
              {album.album}
            </button>
          ))}
        </div>
      </div>

      <h1
        className="text-center mb-3"
        style={{ color: "#ffff", textShadow: "2px 2px 8px #000" }}>
        {selectedAlbum ? capitalizeWords(selectedAlbum) : "All photos"}
      </h1>

      {isLoading ? (
        <div className="gallery-status">Loading ...</div>
      ) : (
        <>
          <div className="gallery-grid">
            {images.map((image, index) => (
              <div
                key={image.media_id}
                className="grid-item"
                onClick={() => openLightbox(index)}>
                <img src={image.url} alt={image.title || "Gallery image"} />
              </div>
            ))}
          </div>
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeLightbox}>
              &times;
            </button>

            <button className="nav-button prev" onClick={goToPrevious}>
              &#10094;
            </button>

            <div className="main-image-container">
              <img
                key={images[currentImageIndex].media_id}
                src={images[currentImageIndex].url}
                alt={images[currentImageIndex].title || "Enlarged view"}
                className="main-image"
              />
            </div>

            <button className="nav-button next" onClick={goToNext}>
              &#10095;
            </button>

            <div className="thumbnail-strip-container">
              <div className="thumbnail-strip">
                {images.map((image, index) => (
                  <img
                    key={image.media_id}
                    src={image.url}
                    alt={image.title || "Thumbnail"}
                    className={`strip-thumbnail ${
                      index === currentImageIndex ? "active" : ""
                    }`}
                    onClick={() => goToImage(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
