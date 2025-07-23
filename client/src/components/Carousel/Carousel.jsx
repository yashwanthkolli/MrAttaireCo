import './Carousel.Styles.css';

const Carousel = () => {
  return (
    <div className='carousel'>
      <div className='carousel-track'>
        <div className='slide text'>
          Sale 30% off. Use code: sale30
        </div>
        <div className='slide-small'>★</div>
        <div className='slide text'>
          Sale 30% off. Use code: sale30
        </div>
        <div className='slide-small'>★</div>
        <div className='slide text'>
          Sale 30% off. Use code: sale30
        </div>
        <div className='slide-small'>★</div>
        <div className='slide text'>
          Sale 30% off. Use code: sale30
        </div>
      </div>
    </div>
  )
}

export default Carousel