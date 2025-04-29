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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
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

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
  
    if (!trimmedName || !trimmedEmail || !trimmedUsername || !trimmedPassword) {
      setError('All fields are required');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Invalid email format');
      return;
    }
  
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
  
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, {
        name: trimmedName,
        email: trimmedEmail,
        username: trimmedUsername,
        password: trimmedPassword,
      });
      setToken(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data.message || 'Registration failed');
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
              <PersonAddIcon sx={{ fontSize: 40, color: '#2196F3' }} />
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
            Register
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
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
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
                Register
              </GradientButton>
            </motion.div>
            <Typography align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <Link href="/login" variant="body2" sx={{ color: '#2196F3' }}>
                Login
              </Link>
            </Typography>
          </Box>
        </NeumorphicBox>
      </Container>
    </motion.div>
  );
};

export default Register;