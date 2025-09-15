// src/components/HeroEditor.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  Divider,
  Grid
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const HeroEditor = () => {
  const [heroData, setHeroData] = useState({
    title: '',
    subtitle: '',
    ctabutton: {
      text: 'Shop Now',
      link: '/products'
    },
    theme: 'dark',
    isActive: true
  });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch current hero data
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/hero');
        setHeroData(response.data.data);
        setCurrentImage(response.data.data.backgroundImage.url);
      } catch (error) {
        console.error('Error fetching hero data:', error);
        setMessage({ type: 'error', text: 'Failed to fetch hero data' });
      }
    };

    fetchHeroData();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('cta.')) {
      const ctaField = name.split('.')[1];
      setHeroData(prev => ({
        ...prev,
        ctabutton: {
          ...prev.ctabutton,
          [ctaField]: value
        }
      }));
    } else {
      setHeroData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSwitchChange = (e) => {
    setHeroData(prev => ({
      ...prev,
      [e.target.name]: e.target.checked
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.put('http://localhost:5000/api/v1/hero', heroData);
      setMessage({ type: 'success', text: 'Hero content updated successfully!' });
    } catch (error) {
      console.error('Error updating hero:', error);
      setMessage({ type: 'error', text: 'Failed to update hero content' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!image) {
      setMessage({ type: 'error', text: 'Please select an image first' });
      return;
    }

    setImageLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await axios.put('http://localhost:5000/api/v1/hero/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setCurrentImage(response.data.data.url);
      setMessage({ type: 'success', text: 'Hero image updated successfully!' });
      setImage(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hero Section Editor
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Hero Content Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hero Content
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={heroData.title}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Subtitle"
                name="subtitle"
                value={heroData.subtitle}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={3}
                required
              />
              
              <TextField
                fullWidth
                label="CTA Button Text"
                name="cta.text"
                value={heroData.ctaButton ? heroData.ctaButton?.text : ' '}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="CTA Button Link"
                name="cta.link"
                value={heroData.ctaButton ? heroData.ctaButton?.link : ' '}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Theme</InputLabel>
                <Select
                  name="theme"
                  value={heroData.theme}
                  label="Theme"
                  onChange={handleInputChange}
                >
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                </Select>
              </FormControl>
              
              {/* <FormControlLabel
                control={
                  <Switch
                    checked={heroData.isActive}
                    onChange={handleSwitchChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Active"
                sx={{ mt: 2 }}
              /> */}
              
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Update Hero Content'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Hero Image Upload */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hero Background Image
            </Typography>
            
            {currentImage && (
              <Card sx={{ mb: 2 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={currentImage}
                  alt="Current hero background"
                />
              </Card>
            )}
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
              >
                Select Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              
              {image && (
                <Typography variant="body2">
                  Selected: {image.name}
                </Typography>
              )}
              
              <Button
                variant="contained"
                onClick={handleImageUpload}
                disabled={imageLoading || !image}
              >
                {imageLoading ? <CircularProgress size={24} /> : 'Upload Image'}
              </Button>
            </Box>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Recommended size: 1920×1080px (16:9 aspect ratio)
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Preview Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Preview
        </Typography>
        
        <Box
          sx={{
            height: '300px',
            backgroundImage: `url(${currentImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: heroData.theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
            }
          }}
        >
          <Box sx={{ position: 'absolute', zIndex: 1, bottom: 20, left: 20, color: heroData.theme === 'dark' ? 'white' : 'black' }}>
            <Typography variant="h6" gutterBottom>
              {heroData.subtitle.toUpperCase()}
            </Typography>
            <Typography variant="h3" gutterBottom>
              {heroData.title.toUpperCase()}
            </Typography>
            <Button variant="contained" color="primary">
              {heroData.ctaButton?.text}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default HeroEditor;