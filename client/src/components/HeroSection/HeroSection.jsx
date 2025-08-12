import { useEffect, useState } from 'react';
import API from '../../utils/api';

import './HeroSection.Styles.css'
import Message from '../Message/Message';

const HeroSection = () => {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await API.get('/hero');
        setHero(res.data.data);
      } catch (err) {
        console.error('Failed to fetch hero content:', err);
        setMsg({ type: 'error', text: 'Failed to load hero content' });
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  if (loading) {
    return (
      <section className="hero skeleton-hero">
        <div className="hero-content">
          <div className="hero-skeleton-text hero-skeleton-subtitle"></div>
          <div className="hero-skeleton-text hero-skeleton-title"></div>
          <div className="hero-skeleton-button"></div>
        </div>
      </section>
    );
  }

  if (!hero) {
    return (
      msg.text && (
        <Message 
          type={msg.type} 
          message={msg.text} 
          onClose={() => setMsg({ type: '', text: '' })} 
        />
      )
    );
  }

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