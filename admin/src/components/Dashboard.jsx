import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent
} from '@mui/material';
import {
  ShoppingBag as OrdersIcon,
  Inventory as ProductsIcon,
  People as UsersIcon,
  AttachMoney as RevenueIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // These endpoints need to be created in your backend
        const [statsRes, ordersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/admin/stats'),
          axios.get('http://localhost:5000/api/v1/orders/recent')
        ]);
        
        setStats(statsRes.data.data);
        setRecentOrders(ordersRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ icon, title, value, subtitle }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center">
          <Box mr={2}>
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<OrdersIcon color="primary" fontSize="large" />}
            title="Total Orders"
            value={stats.totalOrders}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ProductsIcon color="secondary" fontSize="large" />}
            title="Products"
            value={stats.totalProducts}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<UsersIcon style={{ color: '#4caf50' }} fontSize="large" />}
            title="Customers"
            value={stats.totalUsers}
          />
        </Grid>
      </Grid>
        

      {/* Recent Orders */}
      <Grid item xs={12} md={4} marginTop={10}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Orders
          </Typography>
          <Box>
            {recentOrders.slice(0, 10).map((order) => (
              <Box key={order._id} mb={1} p={1} sx={{ borderBottom: '1px solid #eee' }}>
                <Typography variant="body2">
                  Order #{order._id.slice(-6)}
                </Typography>
                <Typography variant="caption" display="block">
                  {order.currency} {order.total} • {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
    </Box>
  );
};

export default Dashboard;