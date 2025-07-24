/**
 * View page, views specific order in similar layout to OrderCreate but in a single page
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderInfo from '../Components/OrderInfo';
import OrderLine from '../Components/OrderLine';
import OrderHistory from '../Components/OrderHistory';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Divider from '@mui/material/Divider';

export default function OrderView() {
  // State for order number, order details, and error
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [lines, setLines] = useState<readonly any[]>([]);
  const [history, setHistory] = useState<readonly any[]>([]);
  const navigate = useNavigate();

  // Fetch order details on mount based off selected order number
  useEffect(() => {
    if (!orderNumber) return;
    fetch(`http://localhost:3001/orders?orderNumber=${orderNumber}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch order');
        return res.json();
      })
      .then(data => {
        setOrder(Array.isArray(data) ? data[0] : data);
      })
      .catch(e => {
        setError(e.message || 'Unknown error');
      });
  }, [orderNumber]); 

  // When order is loaded, ensure all lines and history rows have unique IDs
  useEffect(() => {
    if (order) {
      setLines((order.lines || []).map((line: any, idx: number) => ({
        ...line,
        id: line.id ?? `${order.orderNumber}-line-${idx}`,
      })));
      setHistory((order.history || []).map((h: any, idx: number) => ({
        ...h,
        id: h.id ?? `${order.orderNumber}-history-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      })));
    }
  }, [order]);

  // Sync lines and history to order object whenever they change
  useEffect(() => {
    if (order) {
      setOrder({
        ...order,
        lines: lines,
        history: history,
      });
    }
  }, [lines, history]);

  // Debug: Log history array after it is set
  useEffect(() => {
    console.log('Order history state:', history);
  }, [history]);

  if (error) return <Typography color="error" sx={{ mt: 4 }}>{error}</Typography>;
  if (!order && !error) return null;

  //Basic info followed by lines and history
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', pt: 0, px: 3, pb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton aria-label="Back" onClick={() => navigate(-1)} size="large" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">Order Details</Typography>
      </Box>
      <OrderInfo fields={{
        ...order,
        billingAddress: typeof order.billingAddress === 'object' && order.billingAddress !== null
          ? Object.values(order.billingAddress).filter(Boolean).join(', ')
          : order.billingAddress,
        shippingAddress: typeof order.shippingAddress === 'object' && order.shippingAddress !== null
          ? Object.values(order.shippingAddress).filter(Boolean).join(', ')
          : order.shippingAddress,
      }} setFields={() => {}} readOnly />
      <Divider sx={{ my: 3 }} />
      <OrderLine rows={lines} setRows={setLines} readOnly />
      <Divider sx={{ my: 3 }} />
      <OrderHistory
        rows={history}
        setRows={setHistory}
        readOnly
      />
    </Box>
  );
}
