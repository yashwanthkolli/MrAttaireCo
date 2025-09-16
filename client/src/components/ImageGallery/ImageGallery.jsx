import { useState } from 'react';

import './ImageGallery.Styles.css';

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="image-grid">
      {images.map((img, index) => (
        <div 
          key={index} 
          className='img-container'
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
    </div>
  );
}

export default ImageGallery