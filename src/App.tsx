import { useRef, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@material-ui/core";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import {
  fetchShipments,
  FetchShipmentsResult,
  LoadingResult,
} from "./data/fetch-shipments";
import { Navbar } from "./components/Navbar";
import { DashboardPage } from "./pages/DashboardPage";
import { ShipmentsPage } from "./pages/ShipmentsPage";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2AC3AD",
    },
  },
});

const INITIAL_RESULT: LoadingResult = {
  status: "LOADING",
};

export const App = () => {
  const [fetchShipmentsResult, setFetchShipmentsResult] = useState<
    FetchShipmentsResult | LoadingResult
  >(INITIAL_RESULT);
  useEffect(() => {
    fetchShipments().then((result) => setFetchShipmentsResult(result));
  }, []);
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
            <DashboardPage data={fetchShipmentsResult} />
          </Route>
          <Route path="/shipments">
            <ShipmentsPage
              navBarHeight={navBarHeight}
              data={fetchShipmentsResult}
            />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
};
