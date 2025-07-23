import './ColorSelector.Styles.css'

const ColorSelector = ({ variants, selectedColor, onSelectColor }) => {
  return (
    <div className="color-selector selector">
      <label>Select Color</label>
      <div className="color-options options">
        {variants.map(variant => (
          <button
            key={variant.color}
            className={`color-option ${selectedColor === variant.color ? 'selected' : ''}`}
            onClick={() => onSelectColor(variant)}
            style={{ backgroundColor: variant.color }}
            aria-label={variant.color}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;