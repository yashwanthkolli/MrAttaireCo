import HeroSection from './HeroSection.jsx';
import AboutUsSection from './AboutUsSection.jsx';
import GallerySection from './GallerySection.jsx';
import CtaSection from './CtaSection.jsx';
import TestimonialsSection from './Testimonials.jsx';

import './AboutUs.Styles.css';

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