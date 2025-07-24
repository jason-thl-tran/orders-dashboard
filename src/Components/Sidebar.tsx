/**
 * Side drawer combined with top app bar
 */
import * as React from 'react';
import { Link } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import type { Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import type { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import HomeIcon from '@mui/icons-material/Home';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import SettingsIcon from '@mui/icons-material/Settings';
import ThemeToggle from './ThemeToggle';
import ClickAwayListener from '@mui/material/ClickAwayListener';


const drawerWidth = 240; 

//Mixins used for open and closed drawer states
const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

//DrawerHeader is used to style the header of the drawer
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

//Stylized App bar for use with stylized drawer
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

//Stylized drawer that allows for persistent drawer with visible icons and use with app bar
const StyledDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open
      ? {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        }
      : {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        }),
  }),
);

interface SidebarProps {
  mode: 'light' | 'dark';
  setMode: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}


export default function Sidebar({ mode, setMode, open, setOpen }: SidebarProps) {
  const theme = useTheme();
  //open closed state for order submenu
  const [orderOpen, setOrderOpen] = React.useState(false);

  //User menu state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  
  //Opens drawer AND submenu when minimized order tab is clicked 
  //Toggles submenu when drawer is open
  const handleOrderClick = () => {
    if (!open) {
      setOpen(true);
      setOrderOpen(true);
    } else {
      setOrderOpen((prev) => !prev);
    }
  };

  //Close the order submenu when the drawer is closed
  React.useEffect(() => {
    if (!open) {
      setOrderOpen(false);
    }
  }, [open]);

  const openBtnRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            ref={openBtnRef}
            sx={[
              { marginRight: 5 },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Order Dashboard
          </Typography>
          <ThemeToggle mode={mode} setMode={setMode} />
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="account of current user"
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={handleMenu}
            sx={{
              transition: 'background 0.2s, transform 0.2s',
              '&:hover': {
                background: 'rgba(95, 95, 95, 0.26)',
                color: '#fff',
                transform: 'scale(1.15)',
              },
            }}
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem>
              <Avatar sx={{ mr: 1 }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Jason Tran</div>
                <div style={{ fontSize: 12, color: '#888' }}>Frontend Developer</div>
                <div style={{ fontSize: 12 }}>json.t.tran@gmail.com</div>
              </div>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <ClickAwayListener
        onClickAway={e => {
          {/* Closes drawer when clicking away */}
          if (open && openBtnRef.current && e.target instanceof Node && !openBtnRef.current.contains(e.target)) {
            setOpen(false);
          }
        }}
      >
        <div>
          <StyledDrawer variant="permanent" open={open}>
            <DrawerHeader>
              <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
              
              {/* Home tab */}

              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={Link}
                  to="/"
                  sx={[
                    { minHeight: 48, px: 2.5 },
                    open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      { minWidth: 0, justifyContent: 'center' },
                      open ? { mr: 3 } : { mr: 'auto' },
                    ]}
                  >
                    <HomeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Home"
                    sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                  />
                </ListItemButton>

              {/* Order tab */}

              </ListItem>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={handleOrderClick}
                  sx={[
                    { minHeight: 48, px: 2.5 },
                    open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      { minWidth: 0, justifyContent: 'center' },
                      open ? { mr: 3 } : { mr: 'auto' },
                    ]}
                  >
                    <FormatListBulletedIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Order"
                    sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                  />
                  {open ? (orderOpen ? <ExpandLess /> : <ExpandMore />) : null}
                </ListItemButton>
                
                {/* Submenu for Order */}

                <Collapse in={orderOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton 
                      component={Link}
                      to="/order-create"
                      sx={{ pl: 4 }}>
                      <ListItemText primary="Create"/>
                    </ListItemButton>
                    <ListItemButton
                      component={Link}
                      to="/order-list"
                      sx={{ pl: 4 }}
                    >
                      <ListItemText primary="List"/>
                    </ListItemButton>
                  </List>
                </Collapse>
              </ListItem>
            </List>
            <Divider />
            <List>

              {/* Profile */}

              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  sx={[
                    { minHeight: 48, px: 2.5 },
                    open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      { minWidth: 0, justifyContent: 'center' },
                      open ? { mr: 3 } : { mr: 'auto' },
                    ]}
                  >
                    <AccountCircle sx={{ width: 24, height: 24 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Profile"
                    sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                  />
                </ListItemButton>
              </ListItem>

              {/* Setting */}

              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  sx={[
                    { minHeight: 48, px: 2.5 },
                    open ? { justifyContent: 'initial' } : { justifyContent: 'center' },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      { minWidth: 0, justifyContent: 'center' },
                      open ? { mr: 3 } : { mr: 'auto' },
                    ]}
                  >
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Settings"
                    sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </StyledDrawer>
        </div>
      </ClickAwayListener>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
       
      </Box>
    </Box>
  );
}