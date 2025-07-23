import { useNavigate } from 'react-router-dom';
import Img1 from '../../assets/AboutUs/cta1.jpg';
import Img2 from '../../assets/AboutUs/cta2.jpg';
import Img3 from '../../assets/AboutUs/cta3.jpg';
import Img4 from '../../assets/AboutUs/cta4.jpg';
import { motion, scale } from 'framer-motion';

const CtaSection = () => {
  const navigte = useNavigate()
  const imgVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        ease: "easeOut",
        duration: 0.6,
        delay: 0.8
      }
    }
  };

  return (
    <section className='cta-section'>
        <motion.div 
          className='container'
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className='sub-heading'>IGNITE YOUR STYLE</h2>
          <div className='heading'>
            READY TO REDISCOVER THE JOY OF<br />
            DRESSING THROUGH THOUGHTFULLY<br />
            CRAFTED, TIMELESS PIECES<br />
            THAT LAST BEYOND TRENDS?
            
            <motion.div className='img-container img1' variants={imgVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <img src={Img1} alt='img1' />
            </motion.div>
            <motion.div className='img-container img2' variants={imgVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <img src={Img2} alt='img2' />
            </motion.div>
            <motion.div className='img-container img3' variants={imgVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <img src={Img3} alt='img3' />
            </motion.div>
            <motion.div className='img-container img4' variants={imgVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <img src={Img4} alt='img4' />
            </motion.div>
          </div>
          <p className='text'>
            In a world of fast fashion, we offer an intentional alternative. Each garment is designed 
            with meticulous attention to detail, using only the finest natural materials that age 
            beautifully with time. Our collaborative process ensures you'll own pieces that fit not 
            just your body, but your lifestyle and values - creating a wardrobe that feels authentically 
            you, season after season.
          </p>
          <button className='button' onClick={() => navigte('/products')}>
            Start Your Style Journey
          </button>
        </motion.div>
    </section>
  );
};

export default CtaSection;