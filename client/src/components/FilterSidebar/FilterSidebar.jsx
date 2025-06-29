import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

import './FilterSidebar.Styles.css';
import { IoClose } from "react-icons/io5";

const FilterSidebar = ({ filters, onFilterChange }) => {
  const [open, setOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedColors, setSelectedColors] = useState([]);

  const categories = [
    'tshirts', 'winterwear', 'trackpants', 'joggers', 'shorts'
  ];

  const colors = [
    { color:'black', code: '#000000' }, 
    { color:'white', code: '#ffffff' }, 
    { color:'red', code: '#ff0000' }, 
    { color:'blue', code: '#0000ff' }, 
    { color:'green', code: '#00ff00' }, 
    { color:'violet', code: '#7f00ff' }, 
    { color:'yellow', code: '#ffff00' },
    { color:'gray', code: '#808080' },
  ]

  useEffect(() => {
    onFilterChange({colors: selectedColors.join(",")});
  }, [selectedColors])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  const handlePriceChange = (priceRange) => {
    setPriceRange(priceRange);
  }

  const handleThumbStop = () => {
    onFilterChange({ priceMin: priceRange[0], priceMax: priceRange[1]})
  }

  const handleColorsChange = (e) => {
    if (e.target.checked) {
      setSelectedColors([...selectedColors, e.target.value]);
    } else {
      setSelectedColors(selectedColors.filter((item) => item !== e.target.value));
    }
  }

  const handleResetFilters = () => {
    setPriceRange([0, 5000]);
    setSelectedColors([]);
    onFilterChange({
      category: '',
      priceMin: '',
      priceMax: '',
      sort: '-createdAt'
    });
  }
  
  return (
    <>
      <div className="filter-icon-container" onClick={() => setOpen(!open)}>
        Filters <FaFilter />
      </div>
      <div 
        className="dark-background" 
        style={{
          visibility: open ? 'visible' : 'hidden',
          // width: open ? '100vw' : '0'
        }}
        onClick={() => setOpen(false)}
      ></div>
      <div className={`filter-sidebar ${open ? 'open' : 'close'}`}>
        <div className="title-bar">
          <h1 className="sub-heading">Filters</h1>
          <IoClose onClick={() => setOpen(false)} />
        </div>
        
        <div className="filter-group">
          <select 
            name="category" 
            value={filters.category}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <p className="label">Price Range</p>
        <div className="filter-group range">
          <div className="value">₹.{priceRange[0]}</div>
          <RangeSlider
            min={0}
            max={5000}
            step={100}
            defaultValue={[0, 5000]}
            onInput={handlePriceChange}
            onThumbDragEnd={handleThumbStop}
            ariaLabel={['Min Price', 'Max Price']}
          />
          <div className="value">₹.{priceRange[1]}</div>
        </div>

        <p className="label">Colors</p>
        <div className="filter-group">
          {colors.map(color => (
            <div className="color-checkbox" key={color.color}>
            <input
              type="checkbox"
              value={color.color}
              onChange={handleColorsChange}
            />
            <label><div className="color" style={{background: color.code}}></div> {color.color}</label>
            </div>
          ))}
        </div>

        <p className="label">Sort By</p>
        <div className="filter-group">
          <select
            name="sort"
            value={filters.sort}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-price">Price: High to Low</option>
            <option value="price">Price: Low to High</option>
            <option value="-ratings">Highest Rated</option>
          </select>
        </div>

        <button 
          onClick={handleResetFilters}
          className="btn"
        >
          Clear All Filters
        </button>
      </div>
    </>
  );
};

export default FilterSidebar;