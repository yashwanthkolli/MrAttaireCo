import HeroSection from './HeroSection.jsx';

import './AboutUs.Styles.css';
import AboutUsSection from './AboutUsSection.jsx';
import GallerySection from './GallerySection.jsx';
import CtaSection from './CtaSection.jsx';
import TestimonialsSection from './Testimonials.jsx';

const AboutUs = () => {
  return (
    <div className='about-us'>
      <HeroSection />
      <AboutUsSection />
      <GallerySection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  )
}

export default AboutUs