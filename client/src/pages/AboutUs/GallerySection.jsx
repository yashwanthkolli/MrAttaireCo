import { useState } from 'react';
import Img1 from '../../assets/AboutUs/gallery1.jpg';
import Img2 from '../../assets/AboutUs/gallery2.jpg';
import Img3 from '../../assets/AboutUs/gallery3.jpg';
import Img4 from '../../assets/AboutUs/gallery4.jpg';
import Img5 from '../../assets/AboutUs/gallery5.jpg';
import { FaChevronCircleLeft, FaChevronCircleRight } from 'react-icons/fa';

const GallerySection = () => {
  const [index, setIndex] = useState(0)

  const images = [
    {
      img: Img1,
      alt: 'image-1',
      time: 'July 11, 2025',
      location: 'Heritage Gallery, New York'
    },
    {
      img: Img2,
      alt: 'image-2',
      time: 'July 11, 2025',
      location: 'Kormagala, Bangalore'
    },
    {
      img: Img3,
      alt: 'image-3',
      time: 'July 11, 2025',
      location: 'Westminster, London'
    },
    {
      img: Img4,
      alt: 'image-4',
      time: 'July 11, 2025',
      location: 'Opera House, Sydney'
    },
    {
      img: Img5,
      alt: 'image-5',
      time: 'July 11, 2025',
      location: 'South Bank, London'
    },
  ]

  const handleIncrement = () => {
    setIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
  }

  const handleDecrement = () => {
    setIndex(prev => prev <= 0 ? images.length - 1 : prev - 1)
  }

  return (
    <div className='gallery-section-container'>
      <div 
        className='gallery-section' 
        style={{transform: `translateX(-${index*100}vw)`}} 
      >

        {images.map(image => 
          <div className='img-container'>
            <img src={image.img} alt={image.alt} />
            <div className='time'>
              <p className='taken'>Taken on</p>
              <p>{image.time}</p>
              </div>
            <div className='location'>{image.location}</div>
          </div>
        )}

        
      </div>
      <div className='dots-container'>
        {
          images.map((image, i) => <div className={`dot ${index === i ? 'selected-dot' : ''}`} onClick={() => setIndex(i)}></div>)
        }
      </div>
      <div className='button increment' onClick={handleDecrement}><FaChevronCircleLeft /></div>
      <div className='button decrement' onClick={handleIncrement}><FaChevronCircleRight /></div>
    </div>
  )
}

export default GallerySection