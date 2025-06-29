import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../utils/api';

import './ProductDetails.Styles.css';
import ImageGallery from '../../components/ImageGallery/ImageGallery';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb">
          <a href="/">Home</a> &gt; 
          <a href={`/products/${product.category}`}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </a> &gt; 
          <span>{product.name}</span>
        </nav>

        <div className="product-grid">
          <div className="product-images">
            <ImageGallery images={product.images} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default ProductDetails