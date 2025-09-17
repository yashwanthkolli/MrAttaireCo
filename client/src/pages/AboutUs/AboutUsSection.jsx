import { motion } from 'framer-motion';
import Img1 from '../../assets/AboutUs/img1.jpg';
import Img2 from '../../assets/AboutUs/img2.jpg';

const AboutSectionSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ease: "easeOut",
        duration: 0.6
      }
    }
  };

  return (
    <section className='about-us-section'>
      <motion.div
        className='container'
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div className='left'>
          <motion.div className='img-container img-container-left'>
            <motion.img variants={itemVariants} src={Img1} alt='img1' />
          </motion.div>
          <motion.h2 variants={itemVariants} className='heading'>
            MEET <span className='accent'>MR. ATTIRE & CO</span>
          </motion.h2>
          
          <motion.p variants={itemVariants} className='text'>
            Our brand began with a simple vision: to create timeless 
            clothing that respects people Each piece is crafted with 
            meticulous attention to detail, using only the finest materials.
            Our designs celebrate clean lines, perfect fits, and the beauty 
            of restraint - creating pieces you'll cherish for years, not just seasons.
          </motion.p>
        </motion.div>

        <motion.div className='right'>
          <motion.p variants={itemVariants} className='sub-heading'>
            We're a collective of designers obsessed with sustainable minimalism.
          </motion.p>
          <motion.div className='img-container img-container-left'>
            <motion.img variants={itemVariants} src={Img2} alt='img1' />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

const styles = {
  heading: {
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    fontWeight: 300,
    letterSpacing: '0.1em',
    marginBottom: '1rem',
    color: '#222',
    textTransform: 'uppercase'
  },
  subheading: {
    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    fontWeight: 300,
    letterSpacing: '0.1em',
    marginBottom: '2.5rem',
    color: '#555'
  },
  content: {
    textAlign: 'left',
    maxWidth: '600px',
    margin: '0 auto'
  },
  text: {
    fontSize: '1rem',
    lineHeight: '1.8',
    color: '#333',
    marginBottom: '1.5rem',
    fontWeight: 300
  }
};

export default AboutSectionSection;