import API from "./api";

export async function calculateCartTotals(cart, countryCode) {
  try {
    // Convert all item prices first
    const convertedItems = await Promise.all(
      cart.items.map(async item => {
        const { data } = await API.get('/country/convert', {
          params: {
            priceInr: item.discountedPriceAtAddition || item.priceAtAddition,
            countryCode,
            priceType: 'product' // Apply psychological pricing
          }
        });

        return {
          ...item,
          convertedPrice: data.value,
          convertedPriceFormatted: data.formatted
        };
      })
    );

    // Calculate subtotal from converted prices
    const subtotal = convertedItems.reduce((sum, item) => {
      return sum + (item.convertedPrice * item.quantity);
    }, 0);

    return {
      items: convertedItems,
      subtotal: subtotal
    };
  } catch (error) {
    console.error('Cart calculation failed:', error);
    throw error;
  }
}