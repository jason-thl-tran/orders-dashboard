// File: HomeCard.tsx
// Purpose: Card component for displaying summary information on the home/dashboard page.
//
// Sections:
// - Imports
// - HomeCard component definition
// - Export

// --- Imports ---
import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'
import Tooltip from '@mui/material/Tooltip'

// --- Constants ---
const STATUS_LIST = ['Pending', 'Approved', 'Shipped', 'Cancelled']

// --- Component: HomeCard ---
/**
 * HomeCard
 * Displays a summary card with key metrics or information for the dashboard.
 * Add detailed comments for each const, effect, and styling item below.
 */
export default function HomeCard() {
  // State to store order counts for different statuses
  const [orderCounts, setOrderCounts] = React.useState<Record<string, number>>({})
  const navigate = useNavigate()

  // Effect to fetch order data from the server
  React.useEffect(() => {
    fetch('http://localhost:3001/orders')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch orders')
        return res.json()
      })
      .then((data) => {
        // Process the fetched data to count orders by status
        const ordersArr = Array.isArray(data.orders)
          ? data.orders
          : Array.isArray(data)
          ? data
          : []
        const counts: Record<string, number> = {}
        STATUS_LIST.forEach((status) => {
          counts[status] = ordersArr.filter((o: any) => o.status === status).length
        })
        counts['Total Orders'] = ordersArr.length
        counts['Orders Complete'] = ordersArr.filter((o: any) => o.status === 'Approved' || o.status === 'Shipped').length
        setOrderCounts(counts)
      })
      .catch(() => {})
  }, []) // Empty dependency array means this effect runs once on component mount

  // Prepare data for rendering cards
  const cardData = [
    { label: 'Total Orders', count: orderCounts['Total Orders'] || 0 },
    ...STATUS_LIST.map((status) => ({ label: status, count: orderCounts[status] || 0 })),
    { label: 'Orders Complete', count: orderCounts['Orders Complete'] || 0 },
  ]

  // Handle card click navigation
  const handleCardClick = (label: string) => {
    if (label === 'Orders Complete') return // Do not navigate if 'Orders Complete' card is clicked
    if (label === 'Total Orders') {
      navigate('/order-list') // Navigate to order list page
    } else if (STATUS_LIST.includes(label)) {
      navigate(`/order-list?status=${encodeURIComponent(label)}`) // Navigate to filtered order list page
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', textAlign: 'left' }}>
      <Typography gutterBottom variant="h5" component="div" sx={{ mb: 2, textAlign: 'left' }}>
        Welcome!
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
          mb: 4,
          bgcolor: (theme) => theme.palette.mode === 'dark' ? '#23272e' : '#f3f3f7',
          borderRadius: 3,
          border: (theme) => theme.palette.mode === 'dark' ? '1.5px solid #444' : '1.5px solid #d1d5db',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          p: 3,
          alignItems: 'start',
        }}
      >
        {cardData.map((card) => (
          <Tooltip
            title={card.label !== 'Orders Complete' ? 'Click to view' : ''}
            arrow
            placement="top"
            key={card.label}
          >
            <Box component="span" sx={{ display: 'block' }}>
              <Card
                sx={{
                  minHeight: 120,
                  maxHeight: 120,
                  height: 120,
                  cursor: card.label !== 'Orders Complete' ? 'pointer' : 'default',
                  opacity: card.label === 'Orders Complete' ? 0.6 : 1,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
                onClick={() => handleCardClick(card.label)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ textAlign: 'left' }}>
                    {card.label}
                  </Typography>
                  <Typography variant="h4" color="primary" sx={{ textAlign: 'left' }}>
                    {card.count}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  )
}
