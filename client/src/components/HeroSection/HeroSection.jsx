import { useEffect, useState } from 'react';
import API from '../../utils/api';

import './HeroSection.Styles.css'

const HeroSection = () => {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await API.get('/hero');
        setHero(res.data.data);
      } catch (err) {
        console.error('Failed to fetch hero content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  if (loading) return <div className="hero-loading">Loading...</div>;
  if (!hero) return null;

  return (
    <section 
      className={`hero ${hero.theme}`}
      style={{ 
        backgroundImage: `url(${hero.backgroundImage?.url})` 
      }}
    >
      <div className="hero-content">
        <p>{hero.subtitle}</p>
        <h1 className='heading'>{hero.title}</h1>
        {hero.ctaButton && (
          <a href={hero.ctaButton.link} className="cta-button">
            {hero.ctaButton.text}
          </a>
        )}
      </div>
    </section>
  );
}

export default HeroSection