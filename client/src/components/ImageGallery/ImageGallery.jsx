import { useState } from 'react';

import './ImageGallery.Styles.css';

const ImageGallery = ({ images }) => {
  return (
    <div className="image-grid">
      {images.map((img, index) => (
        <div 
          key={index} 
          className='img-container'
        >
          <img src={img.url} alt={`Thumbnail ${index + 1}`} />
        </div>
      ))}
    </div>
  );
}

export default ImageGallery