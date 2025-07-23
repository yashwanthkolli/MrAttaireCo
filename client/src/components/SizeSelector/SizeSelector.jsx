import './SizeSelector.Styles.css';

const SizeSelector = ({ availableSizes, selectedSize, onSelectSize }) => {
  return (
    <div className="size-selector selector">
      <label>Size:</label>
      <div className="size-options options">
        {availableSizes.map(availableSize => (
          <button
            key={availableSize.size}
            className={`size-option ${selectedSize === availableSize.size ? 'selected' : ''}`}
            onClick={() => onSelectSize(availableSize.size)}
            disabled={availableSize.stock <= 0}
          >
            {availableSize.size}
            {/* {availableSize.stock <= 0 && ' (Out of stock)'} */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;