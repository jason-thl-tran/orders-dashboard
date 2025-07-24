/**
 * Order list page which fetches and displays orders in an MUI data grid
 * with a summary of total orders and status counts.
 * json has modified to be an array of order and lines for fetching. 
 * and each order has an id field for rendering.
 */
import OrderListTable from '../Components/OrderListTable';
import OrderSummary from '../Components/OrderSummary';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';

// fetching orders from json server
export default function OrderList() {
  const [rows, setRows] = useState<any[]>([]);
  // Fetch orders on mount and when 'orderListRefresh' event is fired
  useEffect(() => {
    const fetchOrders = () => {
      fetch('http://localhost:3001/orders')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch orders');
          return res.json();
        })
        .then((data) => {
          let ordersArr = Array.isArray(data) ? data : (data && Array.isArray(data.orders) ? data.orders : []);
          setRows(ordersArr);
          // Dispatch a custom event with the new orders data
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ordersUpdated', { detail: ordersArr }));
          }
        })
        .catch(() => setRows([]));
    };
    fetchOrders();
    const handler = () => fetchOrders();
    window.addEventListener('orderListRefresh', handler);
    return () => window.removeEventListener('orderListRefresh', handler);
  }, []);

  // Listen for 'ordersUpdated' event to update summary props
  useEffect(() => {
    const handler = (e: any) => {
      const ordersArr = e.detail || [];
      setRows(ordersArr);
    };
    window.addEventListener('ordersUpdated', handler);
    return () => window.removeEventListener('ordersUpdated', handler);
  }, []);

  // Ensure each line in each order has a unique id for rendering
  const rowsWithId = rows.map((order, idx) => ({
    ...order,
    id: order.id ?? order.orderNumber ?? `order-${idx}`,
    lines: (order.lines || []).map((line: any, lineIdx: number) => ({
      ...line,
      id: line.id ?? `${order.orderNumber}-line-${lineIdx}`,
    })),
  }));

  const totalOrders = rowsWithId.length;
  const statusCounts = rowsWithId.reduce((acc: Record<string, number>, row: any) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Box sx={{ maxWidth: 2200, mx: 'auto', pt: 0, px: 3, pb: 3 }}>
      <OrderSummary totalOrders={totalOrders} statusCounts={statusCounts} />
      <OrderListTable rows={rowsWithId} />
    </Box>
  );
}


