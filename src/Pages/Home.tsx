/**
 * Home page featuring a summary cards and a calendar featuring due dates
 */
import HomeCard from '../Components/HomeCard';
import Calendar from '../Components/Calendar';
import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';


export default function home() {
 
  const [orders, setOrders] = useState<any[]>([]);

  //Fetch orders on component mount
  useEffect(() => {
    fetch('http://localhost:3001/orders')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
      })
      .then((data) => {
        const ordersArr = Array.isArray(data.orders)
          ? data.orders
          : Array.isArray(data)
          ? data
          : [];
        setOrders(ordersArr);
      })
      .catch(() => {});
  }, []);

  const earlyDates = orders.map((o: any) => o.earlyPickupDate).filter(Boolean);
  const lateDates = orders.map((o: any) => o.latePickupDate).filter(Boolean);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 4,
        mt: 1,
      }}
    >
      <Box sx={{ flex: 2 }}>
        <HomeCard />
      </Box>
      <Box sx={{ flex: 1, minWidth: 320 }}>
        <Calendar earlyDates={earlyDates} lateDates={lateDates} />
      </Box>
    </Box>
  );
}

