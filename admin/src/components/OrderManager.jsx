// src/components/OrderManager.js
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
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import axios from 'axios';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodsFilter] = useState('all');

  // Status update form
  const [statusForm, setStatusForm] = useState({
    status: '',
    notes: ''
  });

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://mrattireco.com/backend/api/v1/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetailDialog = (order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setStatusForm({
      status: order.status,
      notes: ''
    });
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedOrder(null);
    setStatusForm({
      status: '',
      notes: ''
    });
  };

  const handleStatusChange = async () => {
    if (!selectedOrder) return;

    try {
      setStatusUpdateLoading(true);
      await axios.put(`https://mrattireco.com/backend/api/v1/orders/${selectedOrder._id}/status`, {
        status: statusForm.status,
        notes: statusForm.notes
      });

      // Update local state
      const updatedOrders = orders.map(order => 
        order._id === selectedOrder._id 
          ? { ...order, status: statusForm.status }
          : order
      );
      
      setOrders(updatedOrders);
      handleCloseStatusDialog();
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'default';
      case 'confirmed': return 'warning';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'refunded': return 'primary';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // And update the filteredOrders calculation to handle undefined case:
  const filteredOrders = (orders || []).filter(order => {
    if (!order) return false;
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const paymentMatch = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    const paymentMethodMatch = paymentMethodFilter === 'all' || order.paymentMethod === paymentMethodFilter;
    return statusMatch && paymentMatch && paymentMethodMatch;
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
      <Typography variant="h4" gutterBottom>
        Order Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Order Status</InputLabel>
              <Select
                value={statusFilter}
                label="Order Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={paymentFilter}
                label="Payment Status"
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethodFilter}
                label="Payment Method"
                onChange={(e) => setPaymentMethodsFilter(e.target.value)}
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="cod">Cash on Delivery</MenuItem>
                <MenuItem value="razorpay">Razorpay</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="outlined" 
              onClick={fetchOrders}
              disabled={loading}
            >
              Refresh Orders
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>#{order._id.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>
                      {order.shippingAddress?.recipientName || 'N/A'}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell>{formatCurrency(order.total, order.currency)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.paymentStatus} 
                        size="small" 
                        color={getPaymentStatusColor(order.paymentStatus)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        size="small" 
                        color={getStatusColor(order.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDetailDialog(order)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenStatusDialog(order)}
                      >
                        <ExpandMoreIcon />
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
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Order Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetailDialog} 
        maxWidth="md" 
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Order #{selectedOrder._id.slice(-8).toUpperCase()}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Order Details
                  </Typography>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Order Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedOrder.createdAt)}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Status
                    </Typography>
                    <Chip 
                      label={selectedOrder.status} 
                      color={getStatusColor(selectedOrder.status)}
                    />
                  </Box>
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Payment
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.paymentMethod} - 
                      <Chip 
                        label={selectedOrder.paymentStatus} 
                        size="small" 
                        color={getPaymentStatusColor(selectedOrder.paymentStatus)}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                  {selectedOrder.estimatedDelivery && (
                    <Box mb={2}>
                      <Typography variant="body2" color="textSecondary">
                        Estimated Delivery
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedOrder.estimatedDelivery)}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Customer Details
                  </Typography>
                  {selectedOrder.shippingAddress && (
                    <>
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary">
                          Name
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.shippingAddress.recipientName}
                        </Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.shippingAddress.phoneNumber}
                        </Typography>
                      </Box>
                      <Box mb={2}>
                        <Typography variant="body2" color="textSecondary">
                          Address
                        </Typography>
                        <Typography variant="body1">
                          {selectedOrder.shippingAddress.street},<br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br />
                          {selectedOrder.shippingAddress.country} - {selectedOrder.shippingAddress.zipCode}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Order Items
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Variant</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2">
                                {item.product?.name || 'Product not available'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {item.variant && (
                                <Chip 
                                  size="small" 
                                  label={`${item.variant.color} / ${item.variant.size}`}
                                />
                              )}
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.priceAtAddition, selectedOrder.currency)}</TableCell>
                            <TableCell>
                              {formatCurrency(item.priceAtAddition * item.quantity, selectedOrder.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Payment Summary
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">
                          {formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}
                        </Typography>
                      </Box>
                      {selectedOrder.couponUsed && (
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Discount:</Typography>
                          <Typography variant="body2" color="error">
                            -{formatCurrency(selectedOrder.couponUsed.discountValue, selectedOrder.currency)}
                          </Typography>
                        </Box>
                      )}
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Shipping:</Typography>
                        <Typography variant="body2">
                          {formatCurrency(selectedOrder.shippingCost, selectedOrder.currency)}
                        </Typography>
                      </Box>
                      {selectedOrder.tax > 0 && (
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Tax:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(selectedOrder.tax, selectedOrder.currency)}
                          </Typography>
                        </Box>
                      )}
                      <Divider sx={{ my: 1 }} />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" fontWeight="bold">Total:</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {formatCurrency(selectedOrder.total, selectedOrder.currency)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailDialog}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => handleOpenStatusDialog(selectedOrder)}
              >
                Update Status
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
        <DialogTitle>
          Update Order Status
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusForm.status}
              label="Status"
              onChange={(e) => setStatusForm({...statusForm, status: e.target.value})}
            >
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            value={statusForm.notes}
            onChange={(e) => setStatusForm({...statusForm, notes: e.target.value})}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button
            onClick={handleStatusChange}
            disabled={statusUpdateLoading || !statusForm.status}
            variant="contained"
          >
            {statusUpdateLoading ? <CircularProgress size={24} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderManager;