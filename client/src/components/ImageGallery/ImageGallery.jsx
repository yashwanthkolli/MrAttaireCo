import { useEffect, useState } from 'react';
import './ImageGallery.Styles.css';
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from 'react-icons/fa';

const ImageGallery = ({ images, mainImageIndex, setMainImageIndex, totalNumberOfImages, isInWishlist, onAddToWishlist }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  
  const handlePrev = (e) => {
    setMainImageIndex((prev) => mainImageIndex === 0 ? totalNumberOfImages - 1 : prev - 1)
  };

  const handleNext = (e) => {
    setMainImageIndex((prev) => mainImageIndex === totalNumberOfImages -1 ? 0 : prev + 1)
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;

    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      // swipe left → next
      handleNext();
    } else if (diff < -50) {
      // swipe right → prev
      handlePrev();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div
      className="image-grid"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {images.map((img, index) => (
        <div
          key={index}
          className={`img-container ${index === 0 ? 'active' : ''}`}
          onClick={() => setSelectedImage(img.url)}
        >
          <img src={img.url} alt={`Thumbnail ${index + 1}`} />
        </div>
      ))}

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Enlarged view" />
        </div>
      )}

      {/* Mobile slider controls */}
      <div className="slider-controls">
        <button onClick={handlePrev}><FaChevronLeft /></button>
        <button onClick={handleNext}><FaChevronRight /></button>
      </div>

      <button onClick={onAddToWishlist} className='wishlist-btn'>
        {
          isInWishlist ? 
          <span><FaHeart style={{color: '#A3320B'}} /></span>
          : <span><FaRegHeart style={{color: '#A3320B'}} /></span>
        }
      </button>
    </div>
  );
};

export default ImageGallery;
