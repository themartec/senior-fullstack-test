import React from "react";
import { Box, TextField, FormControlLabel, Checkbox, Button, Grid, Avatar, Typography } from '@mui/material';
import { PersonOutlineOutlined } from "@mui/icons-material";
import { Link } from 'react-router-dom'

import { useAppDispatch } from '../redux/store'
import { login } from '../redux/auth'

function Login() {
  const dispatch = useAppDispatch();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    dispatch(login({
      identify: data.get('identify') as string,
      password: data.get('password') as string,
    }))

  };

  return (
    <>
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <PersonOutlineOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="identify"
            label="Username or Email Address"
            name="identify"
            autoComplete="identify"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs={12}>
              <Link to='/register' >
                Dont have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>

    </>
  );
}

export default Login;
