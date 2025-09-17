import { useState } from 'react';

import './Carousel.Styles.css';
import { FaCheck } from 'react-icons/fa';

const Carousel = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // navigator.clipboard.writeText('SALE30')
    //   .then(() => {
    //     setCopied(true);
    //     setTimeout(() => setCopied(false), 2000); // Hide after 4s
    //   })
    //   .catch(err => console.error('Failed to copy text: ', err));
  };

  return (
    <>
      <div className='carousel' onClick={handleCopy}>
        <div className='carousel-track'>
          <div className='slide text'>
            Shipping Worldwide Soon
          </div>
          <div className='slide-small'>★</div>
          <div className='slide text'>
            Shipping Worldwide Soon
          </div>
          <div className='slide-small'>★</div>
          <div className='slide text'>
            Shipping Worldwide Soon
          </div>
          <div className='slide-small'>★</div>
          <div className='slide text'>
            Shipping Worldwide Soon
          </div>
        </div>
      </div>

      {copied && <div className="copy-acknowledgement"><FaCheck /> Coupon code copied!</div>}
      </>
  )
}

export default Carousel