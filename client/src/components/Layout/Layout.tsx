import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Badge,
    Chip,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Menu as MenuIcon,
    DarkMode,
    LightMode,
    Chat,
    Person,
    Settings,
    Logout,
    Wifi,
    SignalWifi4Bar,
    SignalWifiOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';

const DRAWER_WIDTH = 280;

function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { user, logout } = useAuth();
    const { connectionStatus, onlineUsers } = useSocket();
    const { theme: themeMode, toggleTheme } = useCustomTheme();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    const getConnectionIcon = () => {
        switch (connectionStatus) {
            case 'connected':
                return <SignalWifi4Bar color="success" />;
            case 'connecting':
            case 'reconnecting':
                return <Wifi color="warning" />;
            case 'disconnected':
            default:
                return <SignalWifiOff color="error" />;
        }
    };

    const getConnectionText = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'Connected';
            case 'connecting':
                return 'Connecting...';
            case 'reconnecting':
                return 'Reconnecting...';
            case 'disconnected':
            default:
                return 'Disconnected';
        }
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Gemini Chatbot
                </Typography>
            </Toolbar>
            <Divider />

            {/* Connection Status */}
            <Box sx={{ p: 2 }}>
                <Chip
                    icon={getConnectionIcon()}
                    label={getConnectionText()}
                    size="small"
                    variant="outlined"
                    sx={{ width: '100%' }}
                />
            </Box>

            <List sx={{ flexGrow: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton href="/chat">
                        <ListItemIcon>
                            <Chat />
                        </ListItemIcon>
                        <ListItemText primary="Chat" />
                        {onlineUsers.length > 0 && (
                            <Badge badgeContent={onlineUsers.length} color="primary" />
                        )}
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton href="/profile">
                        <ListItemIcon>
                            <Person />
                        </ListItemIcon>
                        <ListItemText primary="Profile" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton href="/settings">
                        <ListItemIcon>
                            <Settings />
                        </ListItemIcon>
                        <ListItemText primary="Settings" />
                    </ListItemButton>
                </ListItem>
            </List>

            <Divider />

            {/* Theme Toggle */}
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={toggleTheme}>
                        <ListItemIcon>
                            {themeMode === 'dark' ? <LightMode /> : <DarkMode />}
                        </ListItemIcon>
                        <ListItemText
                            primary={`${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Gemini Chatbot
                    </Typography>

                    {/* User Menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            {user?.firstName || user?.username}
                        </Typography>
                        <IconButton
                            onClick={handleProfileMenuOpen}
                            size="small"
                            sx={{ ml: 1 }}
                            aria-controls="account-menu"
                            aria-haspopup="true"
                        >
                            <Avatar
                                sx={{ width: 32, height: 32 }}
                                src={user?.avatar}
                                alt={user?.username}
                            >
                                {user?.firstName?.[0] || user?.username?.[0]}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Profile Menu */}
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => window.location.href = '/profile'}>
                    <ListItemIcon>
                        <Person fontSize="small" />
                    </ListItemIcon>
                    Profile
                </MenuItem>
                <MenuItem onClick={() => window.location.href = '/settings'}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>

            {/* Navigation Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 0,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: { xs: '56px', sm: '64px' },
                    height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
                    overflow: 'hidden'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}

export default Layout;