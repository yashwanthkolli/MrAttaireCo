import { Link } from 'react-router-dom';
import LogoLight from '../../assets/logo-white.png';
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import './Footer.Styles.css';

const Footer = () => {
  return (
    <>
      <div className='footer-section'>
        <div className='content'>
          <div className='details'>
            <div className='logo-container'>
              <img src={LogoLight} alt='white-logo' />
              <span className='sub-heading'>Mr Attire & Co</span>
            </div>
            <div className='company-text text'>
              Mr Attire & Co is a modern streetwear label redefining comfort and class. 
              From premium T-shirts to elevated essentials, we design apparel that 
              speaks power, style, and confidence. Built in India, crafted for the world.
            </div>
            <div className='contact text'>
              <div className='email'>
                <div className='medium'>Email</div>
                <div className='value'>support@mrattire.co</div>
              </div>
              <div className='phone'>
                <div className='medium'>Phone Number</div>
                <div className='value'>+91 08233 924723</div>
              </div>
            </div>
          </div>
          <div className='links text'>
            <div className='links-list'>
              <div className='links-title'>Quick Links</div>
              <Link to='/'>Home</Link>
              <Link to='/pages/aboutus'>About Us</Link>
              <Link to='/products'>Products</Link>
              <Link to='/products/tshirts'>T-Shirts</Link>
              <Link to='/products/winterwear'>Winter Wear</Link>
              <Link to='/products/trackpants'>Trackpants</Link>
              <Link to='/products/joggers'>Joggers</Link>
              <Link to='/products/shorts'>Shorts</Link>
            </div>
            <div className='links-list'>
              <div className='links-title'>Others</div>
              <Link to='/pages/FAQs'>FAQs</Link>
              <Link to='/pages/termsandconditions'>Terms and Conditons</Link>
              <Link to='/pages/refundpolicy'>Refund Policy</Link>
              <Link to='/pages/privacypolicy'>Privacy Policy</Link>
              <Link to='/pages/shippinganddelivery'>Shipping and Delivery</Link>
            </div>
            {/* <div className='links-list'>
              <div className='links-title'>Socials</div>
              <Link to='/'>Instagram</Link>
              <Link to='/pages/aboutus'>Facebook</Link>
              <Link to='/products'>LinkedIn</Link>
              <Link to='/products/tshirts'>Twitter</Link>
              <Link to='/products/winterwear'>Email</Link>
              <Link to='/products/trackpants'>WhatsApp</Link>
            </div> */}
          </div>
        </div>
        <div className='socials'>
          <Link to='https://instagram.com' target="_blank" aria-label='Instagram'><FaInstagram /></Link>
          <Link to='https://facebook.com' target="_blank" aria-label='Facebook'><FaFacebook /></Link>
          <Link to='https://linkdedin.com' target="_blank" aria-label='LinkedIn'><FaLinkedin /></Link>
          <Link to='https://twitter.com' target="_blank" aria-label='Twitter'><FaXTwitter /></Link>
          <Link to='https://whatsapp.com' target="_blank" aria-label='Whatsapp'><FaWhatsapp  /></Link>
        </div>
        <div className='copywrite text'>© 2025 Mr Attire Co. All Rights Reserved.</div>
      </div>
      <div className='footnote text'>Made to Perfection with CVision ✨</div>
    </>
  )
}

export default Footer