import { useState } from 'react';

import './ImageGallery.Styles.css';

const ImageGallery = ({ images }) => {
  const [mainImage, setMainImage] = useState(images[0]?.url || '');

  return (
    <div className="image-gallery">
      <div className="main-image">
        <img src={mainImage} alt="Main product view" />
      </div>
      <div className="thumbnail-grid">
        {images.map((img, index) => (
          <div 
            key={index} 
            className={`thumbnail ${mainImage === img.url ? 'active' : ''}`}
            onClick={() => setMainImage(img.url)}
          >
            <img src={img.url} alt={`Thumbnail ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageGallery