const FilterSidebar = ({ filters, onFilterChange }) => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ [name]: value });
  };

  return (
    <div className="filter-sidebar">
      <h4>Filter Products</h4>
      
      <div className="filter-group">
        <h5>Category</h5>
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

      <div className="filter-group">
        <h5>Price Range</h5>
        <div className="price-range">
          <input
            type="number"
            name="priceMin"
            placeholder="Min"
            value={filters.priceMin}
            onChange={handleInputChange}
            className="form-control"
          />
          <span>to</span>
          <input
            type="number"
            name="priceMax"
            placeholder="Max"
            value={filters.priceMax}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
      </div>

      <div className="filter-group">
        <h5>Sort By</h5>
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
        onClick={() => onFilterChange({
          category: '',
          priceMin: '',
          priceMax: '',
          sort: '-createdAt'
        })}
        className="btn btn-clear"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default FilterSidebar;