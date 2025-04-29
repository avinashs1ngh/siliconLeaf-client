import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
// import { AuthContext } from './context/AuthContext';
import { AuthContext } from '../context/AuthContext';

import { motion } from 'framer-motion';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Tooltip,
  InputAdornment,
  Fade,
} from '@mui/material';
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import LabelIcon from '@mui/icons-material/Label';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import { BASE_URL } from '../utils/constant';

// Neumorphic styling for the form container
const NeumorphicBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(145deg, #f0f0f0, #ffffff)',
  borderRadius: '20px',
  boxShadow: '10px 10px 20px #d1d1d1, -10px -10px 20px #ffffff',
  padding: theme.spacing(3),
  margin: 'auto',
  maxWidth: '500px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    maxWidth: '100%',
  },
}));

// Custom button with gradient and hover animation
const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  borderRadius: '30px',
  padding: theme.spacing(1.5),
  color: '#fff',
  fontWeight: 'bold',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    background: 'linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)',
  },
}));

const TaskForm = ({ setTasks, token, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [dueDate, setDueDate] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user.role === 'admin') {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/auth/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(response.data);
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      };
      fetchUsers();
    }
  }, [token, user.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        title,
        description,
        status,
        dueDate: dueDate || null,
      };
      let endpoint = `${BASE_URL}/tasks`;
      if (user.role === 'admin') {
        taskData.userId = userId;
        endpoint = `${BASE_URL}/admin/tasks`;
      }
      const response = await axios.post(endpoint, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prevTasks) => [...prevTasks, response.data]);
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setDueDate('');
      setUserId('');
      setError('');
      if (onTaskAdded) onTaskAdded();
    } catch (err) {
      setError(err.response?.data.message || 'Failed to add task');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <NeumorphicBox>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#333' }}
        >
          Add New Task
        </Typography>
        {error && (
          <Fade in={!!error}>
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          </Fade>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <Tooltip title="Task Title">
            <TextField
              fullWidth
              label="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AddIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </Tooltip>
          <Tooltip title="Task Description">
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </Tooltip>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
              startAdornment={
                <InputAdornment position="start">
                  <LabelIcon color="action" />
                </InputAdornment>
              }
            >
              <MenuItem value="TODO">TODO</MenuItem>
              <MenuItem value="IN PROGRESS">IN PROGRESS</MenuItem>
              <MenuItem value="CLOSED">CLOSED</MenuItem>
            </Select>
          </FormControl>
          {user.role === 'admin' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Assign to User</InputLabel>
              <Select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                label="Assign to User"
                required
                startAdornment={
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="" disabled>
                  Select User
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Tooltip title="Due Date">
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EventIcon color="action" />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </Tooltip>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <GradientButton type="submit" fullWidth startIcon={<AddIcon />}>
              Add Task
            </GradientButton>
          </motion.div>
        </Box>
      </NeumorphicBox>
    </motion.div>
  );
};

export default TaskForm;