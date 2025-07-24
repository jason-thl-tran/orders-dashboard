/**
 * Toggles between light and dark mode
 */
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function ThemeToggle({ mode, setMode }: { mode: 'light' | 'dark'; setMode: (mode: 'light' | 'dark') => void }) {
  
  const handleToggle = () => setMode(mode === 'light' ? 'dark' : 'light');


  return (
    <IconButton
      onClick={handleToggle} 
      color="inherit" 
      sx={{
        transition: 'background 0.2s, transform 0.2s',
        '&:hover': {
          background: 'rgba(95, 95, 95, 0.26)', 
          color: '#fff', 
          transform: 'scale(1.15)', 
        }
      }}
      aria-label="Toggle theme"
    >
      {mode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
}
