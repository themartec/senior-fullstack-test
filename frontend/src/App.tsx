import { Alert, AlertColor, Box, Container, CssBaseline, Snackbar } from "@mui/material";
import { Breakpoint, ThemeProvider, createTheme } from '@mui/material/styles';
import React, { useEffect } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import Dashboard from "./component/dashboard";
import Login from "./component/login";
import MainMenu from "./component/navigation/mainMenu";
import Register from "./component/register";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

//redux
import { Provider, useSelector } from "react-redux";
import { closeSnackbar } from "./redux/snackbar";
import { RootState, store, useAppDispatch } from "./redux/store";

import NiceModal from "@ebay/nice-modal-react";
import { Copyright } from "@mui/icons-material";
import "./App.css";

import 'facebook-js-sdk'

const defaultTheme = createTheme();

function App() {
  useEffect(() => {
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.REACT_APP_FACEBOOK_CLIENT_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v16.0'
      })
    }
  }, [])

  return (
    <Box className="App">
      <Provider store={store}>
        <NiceModal.Provider>
          <ThemeProvider theme={defaultTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Login />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="*" element={<div>Page is not found</div>} />
                </Route>
                <Route path="/auction" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="*" element={<div>Page is not found</div>} />
                </Route>
              </Routes>
            </LocalizationProvider>
          </ThemeProvider>
        </NiceModal.Provider>
      </Provider>
    </Box>
  );
}

interface ContentProps {
  maxWidth?: Breakpoint;
  fullWidth?: boolean;
  sx?: any;
}

const Content = (props: ContentProps) => {
  return <>
    <Container component="main" {...props}>
      <CssBaseline />
      {/* BEGIN Here we Layout components */}
      <Outlet />
      {/* END Here we Layout components */}
      <Popup />
    </Container>
  </>
}

const AdminLayout: React.FC = () => {
  return <>
    <>
      <Container maxWidth={'lg'}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '0 auto',
            outline: '1px solid black',
          }}
        >
          <MainMenu />
          <Content />
        </Box>
      </Container>
    </>
  </>
}

const Layout: React.FC = () => {
  return (
    <>
      <Content maxWidth="xs" />
      <Copyright />
    </>
  );
};

const Popup: React.FC = () => {

  const snackBar: any = useSelector((state: RootState) => state.snackBar)
  const dispatch = useAppDispatch()

  return <>
    <Snackbar open={snackBar.open} onClose={() => { dispatch(closeSnackbar()) }} message={snackBar.message}>
      <Alert onClose={() => { dispatch(closeSnackbar()) }} severity={snackBar.severity as AlertColor} sx={{ width: '100%' }}>
        {snackBar.message}
      </Alert>
    </Snackbar>
  </>
}

export default App;
