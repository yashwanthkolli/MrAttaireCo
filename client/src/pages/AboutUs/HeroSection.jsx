import { FaArrowDown, FaArrowRight } from 'react-icons/fa6';
import modelImg from '../../assets/AboutUs/model.png';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className='hero-page-container'>
      <div className='hero-page'>
        <div className='background-gradient'></div>
        <div className='model-img-container'>
          <img src={modelImg} alt='model' />
        </div>
        <h1 className='title'>ELEVATE YOUR STYLE</h1>
        <div className='scroll-btn'><FaArrowDown /></div>
        <Link className='sub-heading' to='/products'><span className='underline'>Browse Collections</span><FaArrowRight /></Link>
      </div>
    </div>
  )
}

export default HeroSection