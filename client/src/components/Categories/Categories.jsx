import { useNavigate } from 'react-router-dom';

import './Categories.Styles.css';

const Categories = () => {
  const navigate = useNavigate();

  const handleClick = (link) =>  {
    navigate(link)
  }

  return (
    <div className='categories-section'>
      <div className='categories-container'>
        <div className='category tshirts' onClick={() => handleClick('/products/category/tshirts')}>
          <div className='background'></div>
          <div className='category-heading'>
            <span className='name heading'>T-Shirts</span>
          </div>
        </div>
        <div className='category winterwear disabled' /* onClick={() => handleClick('/products/winterwear')} */> 
          <div className='background'></div>
          <div className='category-heading'>
            <span className='name heading'>Winter Wear</span>
          </div>
          <div className='disabled-text'>Coming Soon</div>
        </div>
        <div className='category trackpants disabled' /* onClick={() => handleClick('/products/trackpants')} */>
          <div className='background'></div>
          <div className='category-heading'>
            <span className='name heading'>TrackPants</span>
          </div>
          <div className='disabled-text'>Coming Soon</div>
        </div>
        <div className='category joggers disabled' /* onClick={() => handleClick('/products/joggers')} */>
          <div className='background'></div>
          <div className='category-heading'>
            <span className='name heading'>Joggers</span>
          </div>
          <div className='disabled-text'>Coming Soon</div>
        </div>
        <div className='category shorts disabled' /* onClick={() => handleClick('/products/shorts')} */>
          <div className='background'></div>
          <div className='category-heading'>
            <span className='name heading'>Shorts</span>
          </div>
          <div className='disabled-text'>Coming Soon</div>
        </div>
      </div>
    </div>
  )
}

export default Categories