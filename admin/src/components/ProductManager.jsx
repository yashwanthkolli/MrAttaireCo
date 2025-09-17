// src/components/ProductManager.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import axios from 'axios';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    retailPrice: '', 
    category: '',
    isFeatured: false,
    isActive: true,
    information: '',
    variants: [{ color: '', sizes: [{ size: '', stock: '' }] }]
  });

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://mrattireco.com/backend/api/v1/products/admin');
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      // Editing existing product
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price, 
        retailPrice: product.retailPrice,
        category: product.category,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        information: product.information,
        variants: product.variants.map(variant => ({
          color: variant.color,
          sizes: variant.sizes.map(size => ({
            size: size.size,
            stock: size.stock
          }))
        }))
      });
    } else {
      // Creating new product
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        isFeatured: false,
        isActive: true,
        information: '',
        variants: [{ color: '', sizes: [{ size: '', stock: '' }] }]
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVariantChange = (variantIndex, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex][field] = value;
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].sizes[sizeIndex][field] = value;
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { color: '', sizes: [{ size: '', stock: '' }] }]
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      const updatedVariants = [...formData.variants];
      updatedVariants.splice(index, 1);
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
    }
  };

  const addSize = (variantIndex) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[variantIndex].sizes.push({ size: '', stock: '' });
    setFormData(prev => ({ ...prev, variants: updatedVariants }));
  };

  const removeSize = (variantIndex, sizeIndex) => {
    if (formData.variants[variantIndex].sizes.length > 1) {
      const updatedVariants = [...formData.variants];
      updatedVariants[variantIndex].sizes.splice(sizeIndex, 1);
      setFormData(prev => ({ ...prev, variants: updatedVariants }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        price: Math.round(formData.price)
      };

      if (editingProduct) {
        await axios.put(`https://mrattireco.com/backend/api/v1/products/${editingProduct._id}`, submitData);
      } else {
        await axios.post('https://mrattireco.com/backend/api/v1/products', submitData);
      }

      fetchProducts();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product');
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await axios.put(`https://mrattireco.com/backend/api/v1/products/${productId}`, { 
        isActive: !currentStatus 
      });
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      setError('Failed to update product status');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`https://mrattireco.com/backend/api/v1/products/${productId}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product');
      }
    }
  };

  const handleOpenImageDialog = (productId) => {
    setSelectedProductId(productId);
    setSelectedImage(null);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
  };

  const handleImageChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', selectedImage);

      await axios.put(`https://mrattireco.com/backend/api/v1/products/${selectedProductId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      fetchProducts();
      handleCloseImageDialog();
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter products based on status
  const filteredProducts = products.filter(product => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return product.isActive;
    if (statusFilter === 'inactive') return !product.isActive;
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Product Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Status Filter */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <FormControl>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Products</MenuItem>
            <MenuItem value="active">Active Only</MenuItem>
            <MenuItem value="inactive">Inactive Only</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images.find(img => img.isPrimary)?.url || product.images[0].url}
                          alt={product.name}
                          style={{ width: 50, height: 50, objectFit: 'cover' }}
                        />
                      ) : (
                        <ImageIcon style={{ width: 50, height: 50 }} />
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Chip label={product.category} size="small" />
                    </TableCell>
                    <TableCell>₹{(product.price).toFixed(2)}</TableCell>
                    <TableCell>
                      {product.variants.reduce((total, variant) => {
                        return total + variant.sizes.reduce((sum, size) => sum + size.stock, 0);
                      }, 0)}
                    </TableCell>
                    <TableCell>
                      {product.isFeatured ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenImageDialog(product._id)}
                      >
                        <UploadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleActive(product._id, product.isActive)}
                        color={product.isActive ? 'error' : 'success'}
                      >
                        {product.isActive ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item size={3}>
                <TextField
                  fullWidth
                  label="Price (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  inputProps={{ step: "0.01", min: "0" }}
                  required
                />
              </Grid>
              <Grid item size={3}>
                <TextField
                  fullWidth
                  label="Max Retail Price (₹)"
                  name="retailPrice"
                  type="number"
                  value={formData.retailPrice}
                  onChange={handleInputChange}
                  inputProps={{ step: "0.01", min: "0" }}
                />
              </Grid>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={1}
                required
              />
              <Grid item size={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="tshirts">T-Shirts</MenuItem>
                    <MenuItem value="shirts">Shirts</MenuItem>
                    <MenuItem value="trackpants">Trackpants</MenuItem>
                    <MenuItem value="jogger">Jogger</MenuItem>
                    <MenuItem value="winterwear">Winterwear</MenuItem>
                    <MenuItem value="shorts">Shorts</MenuItem>
                    <MenuItem value="jackets">Jackets</MenuItem>
                    <MenuItem value="accessories">Accessories</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item size={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      name="isFeatured"
                    />
                  }
                  label="Featured Product"
                />
              </Grid>
              <TextField
                fullWidth
                label="Product Information"
                name="information"
                value={formData.information}
                onChange={handleInputChange}
                multiline
                rows={8}
              />
              
              {/* Variants Section */}
              <Grid item size={12}>
                <Typography variant="h6" gutterBottom>
                  Variants
                </Typography>
                {formData.variants.map((variant, variantIndex) => (
                  <Paper key={variantIndex} sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <TextField
                        label="Color"
                        value={variant.color}
                        onChange={(e) => handleVariantChange(variantIndex, 'color', e.target.value)}
                        required
                        sx={{ flexGrow: 1, mr: 1 }}
                      />
                      <IconButton
                        onClick={() => removeVariant(variantIndex)}
                        disabled={formData.variants.length <= 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Sizes
                    </Typography>
                    {variant.sizes.map((size, sizeIndex) => (
                      <Box key={sizeIndex} display="flex" alignItems="center" mb={1}>
                        <TextField
                          label="Size"
                          value={size.size}
                          onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'size', e.target.value)}
                          required
                          sx={{ mr: 1, width: 100 }}
                        />
                        <TextField
                          label="Stock"
                          type="number"
                          value={size.stock}
                          onChange={(e) => handleSizeChange(variantIndex, sizeIndex, 'stock', parseInt(e.target.value) || 0)}
                          required
                          sx={{ mr: 1, width: 100 }}
                        />
                        <IconButton
                          onClick={() => removeSize(variantIndex, sizeIndex)}
                          disabled={variant.sizes.length <= 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    
                    <Button
                      onClick={() => addSize(variantIndex)}
                      startIcon={<AddIcon />}
                      size="small"
                    >
                      Add Size
                    </Button>
                  </Paper>
                ))}
                
                <Button
                  onClick={addVariant}
                  startIcon={<AddIcon />}
                  variant="outlined"
                >
                  Add Variant
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProduct ? 'Update' : 'Create'} Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={imageDialogOpen} onClose={handleCloseImageDialog}>
        <DialogTitle>Upload Product Image</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>Cancel</Button>
          <Button
            onClick={handleImageUpload}
            disabled={!selectedImage || uploading}
            variant="contained"
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManager;