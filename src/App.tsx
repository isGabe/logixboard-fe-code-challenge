import { useRef, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@material-ui/core';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2AC3AD'
    }
  }
})

export const App = () => {
  const navBarRef = useRef<HTMLDivElement>(null);
  const [navBarHeight, setNavBarHeight] = useState<number | null>(null);

  useEffect(() => {
    if (navBarRef.current) {
      setNavBarHeight(navBarRef.current.clientHeight);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div ref={navBarRef}>
          <Navbar />
        </div>
        <Switch>
          <Route exact path="/">
            <Redirect to="/dashboard" />
          </Route>
          <Route path="/dashboard">
            <DashboardPage />
          </Route>
          <Route path="/shipments">
            <ShipmentsPage navBarHeight={navBarHeight} />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}
