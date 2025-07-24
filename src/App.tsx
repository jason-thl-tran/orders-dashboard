/**
 * Root component 
 * Sets up theme, sidebar, and routing
 */
import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import OrderList from './Pages/OrderList'
import OrderCreate from './Pages/OrderCreate'
import OrderView from './Pages/OrderView'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/700.css'
import Sidebar from './Components/Sidebar'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles';

const drawerWidth = 240

function App() {
  // States for light and dark mode as well as side drawer open or close
  const [mode, setMode] = React.useState<'light' | 'dark'>('dark')
  const [open, setOpen] = React.useState(false)

  const theme = createTheme({
    palette: { mode },
    typography: {
      fontFamily: '"Manrope", Arial, sans-serif',
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Sidebar mode={mode} setMode={setMode} open={open} setOpen={setOpen} />
        <Box
          component="main"
          sx={(theme: Theme) => ({
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            pt: 0,
            px: 3,
            pb: 3,
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: open ? `${drawerWidth}px` : 0,
            minHeight: '100vh',
          })}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/order-list" element={<OrderList />} />
            <Route path="/order-create" element={<OrderCreate />} />
            <Route path="/order-view/:orderNumber" element={<OrderView />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
