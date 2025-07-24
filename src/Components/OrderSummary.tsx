/**
 * Generates summary panel, displaying total orders and status counts
 */
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';


interface OrderSummaryProps {
  totalOrders: number; // Total number of orders
  statusCounts: Record<string, number>; // Map of status to count
}


const statuses = ['Pending', 'Approved', 'Shipped', 'Cancelled'];


export default function OrderSummary({ totalOrders, statusCounts }: OrderSummaryProps) {
  return (
    <Paper sx={{ width: '100%', mb: 2, p: 2, background: (theme) => theme.palette.mode === 'dark' ? '#23272e' : '#f8fafc', boxShadow: 'none', border: (theme) => theme.palette.mode === 'dark' ? '1px solid #444' : '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          Total Orders: {totalOrders}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
          {statuses.map((status, idx) => (
            <React.Fragment key={status}>
              {idx !== 0 && <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />}
              <Typography variant="body2" sx={{ minWidth: 100, textAlign: 'center' }}>
                <strong>{status}:</strong> {statusCounts[status] || 0}
              </Typography>
            </React.Fragment>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
