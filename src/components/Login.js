import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/system';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { BASE_URL } from '../utils/constant';

const NeumorphicBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(145deg, #f0f0f0, #ffffff)',
  borderRadius: '20px',
  boxShadow: '10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff',
  padding: theme.spacing(4),
  margin: 'auto',
  maxWidth: '400px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    maxWidth: '100%',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  borderRadius: '30px',
  padding: theme.spacing(1.5),
  color: '#fff',
  fontWeight: 'bold',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
  },
}));

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
  
    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password are required');
      return;
    }
  
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: trimmedEmail,
        password: trimmedPassword,
      });
      setToken(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data.message || 'Login failed');
    }
  };
  
  

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (e) => e.preventDefault();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Container maxWidth="xs" sx={{ mt: 8 }}>
        <NeumorphicBox>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <LockOutlinedIcon sx={{ fontSize: 40, color: '#2196F3' }} />
            </motion.div>
          </Box>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              variant="outlined"
              helperText="Use your email to log in"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <GradientButton type="submit" fullWidth>
                Login
              </GradientButton>
            </motion.div>
            <Typography align="center" sx={{ mt: 2 }}>
              Don't have an account?{' '}
              <Link href="/register" variant="body2" sx={{ color: '#2196F3' }}>
                Register
              </Link>
            </Typography>
          </Box>
        </NeumorphicBox>
      </Container>
    </motion.div>
  );
};

export default Login;