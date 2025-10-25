import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CurrencySwitcher from './CurrencySwitcher';
import TopBar from './TopBar';
import {
  Button,
  Text,
  Avatar,
  Divider,
  makeStyles,
  tokens,
  shorthands,
  mergeClasses
} from '@fluentui/react-components';
import {
  Board24Regular,
  Payment24Regular,
  Money24Regular,
  ChartMultiple24Regular,
  Folder24Regular,
  BuildingBank24Regular,
  Person24Regular
} from '@fluentui/react-icons';
import './Layout.css';

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground1
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    // background: 'linear-gradient(180deg, #667eea 0%, #764ba2 50%, #5a67d8 100%)',
    borderRight: 'none',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    color: 'black',
    position: 'relative',
    marginTop: '60px',
    paddingTop: '15px',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%)',
      pointerEvents: 'none'
    }
  },
  sidebarOpen: {
    width: '280px'
  },
  sidebarClosed: {
    width: '72px'
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding(tokens.spacingVerticalXL, tokens.spacingHorizontalL),
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: '80px',
    paddingLeft: '10px',
    position: 'relative',
    backdropFilter: 'blur(10px)',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '20px',
      right: '20px',
      height: '1px',
      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)'
    }
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    color: 'white',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
    }
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'black',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    letterSpacing: '-0.5px',
    marginLeft: '10px',
  },
  toggleButton: {
    minWidth: '36px',
    height: '36px',
    backgroundColor: 'rgba(44, 41, 41, 0.15)',
    color: 'black',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
    marginRight: '10px',
    marginTop: '10px',
    marginLeft: '10px',
    zIndex: 1000,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      transform: 'scale(1.05)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    }
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalM),
    gap: '6px',
    overflowY: 'auto',
    paddingLeft: '10px',
    paddingRight: '10px',
    '&::-webkit-scrollbar': {
      width: '4px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '2px'
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '2px',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.5)'
      }
    }
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalM),
    borderRadius: '5px',
    textDecoration: 'none',
    paddingLeft: '10px',
    color: 'rgba(0, 0, 0, 0.7)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    minHeight: '44px',
    position: 'relative',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    justifyContent: 'flex-start',
    marginBottom: '2px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      color: 'black',
      transform: 'translateX(4px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '3px',
      height: '0',
      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '0 2px 2px 0',
      transition: 'height 0.3s ease'
    },
    '&:hover::before': {
      height: '60%'
    }
  },
  navItemActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    color: 'black',
    fontWeight: '600',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
    '&:hover': {
      backgroundColor: 'rgba(102, 126, 234, 0.15)',
      transform: 'translateX(4px)',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4px',
      height: '70%',
      background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '0 2px 2px 0',
      boxShadow: '0 0 8px rgba(102, 126, 234, 0.3)'
    }
  },
  navIcon: {
    fontSize: '20px',
    minWidth: '20px',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'inherit',
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
    transition: 'all 0.3s ease'
  },
  navLabel: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'inherit',
    letterSpacing: '0.3px',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  },
  sidebarFooter: {
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '20px',
      right: '20px',
      height: '1px',
      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)'
    }
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    // marginBottom: tokens.spacingVerticalM,
    ...shorthands.padding('16px'),
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'black',
    position: 'relative',
    overflow: 'hidden',
    marginLeft: '10px',
    marginRight: '10px',
    marginBottom: '10px',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)'
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.35)'
    }
  },
  userDetails: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: '8px',
    gap: '2px'
  },
  userName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
    lineHeight: '1.2',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    letterSpacing: '0.5px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: '100%'
  },
  userEmail: {
    fontSize: '12px',
    color: '#666666',
    margin: 0,
    lineHeight: '1.3',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    letterSpacing: '0.3px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    opacity: 0.9
  },
  footerActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%'
  },
  mainContent: {
    flex: 1,
    overflow: 'auto',
    marginTop: '60px',
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL)
  }
});

const Layout: React.FC = () => {
  const styles = useStyles();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Board24Regular /> },
    { path: '/transactions', label: 'Transactions', icon: <Payment24Regular /> },
    { path: '/budgets', label: 'Budgets', icon: <Money24Regular /> },
    { path: '/analytics', label: 'Analytics', icon: <ChartMultiple24Regular /> },
    { path: '/categories', label: 'Categories', icon: <Folder24Regular /> },
    { path: '/accounts', label: 'Accounts', icon: <BuildingBank24Regular /> },
    { path: '/profile', label: 'Profile', icon: <Person24Regular /> },
  ];

  return (
    <div className={styles.layout}>
      <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <aside className={mergeClasses(
        styles.sidebar,
        isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
      )}>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{ textDecoration: 'none', width: '100%' }}
            >
              <Button
                appearance="transparent"
                className={mergeClasses(
                  styles.navItem,
                  isActive(item.path) ? styles.navItemActive : ''
                )}
                style={{ 
                  width: '100%', 
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  color: 'inherit'
                }}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {isSidebarOpen && <Text className={styles.navLabel}>{item.label}</Text>}
              </Button>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {isSidebarOpen && (
            <div className={styles.userInfo}>
              <Avatar
                name={user?.name}
                size={32}
                color="colorful"
              />
              <div className={styles.userDetails}>
                <Text className={styles.userName}>{user?.name}</Text>
                <Text className={styles.userEmail}>{user?.email}</Text>
              </div>
            </div>
          )}
          
        </div>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;



