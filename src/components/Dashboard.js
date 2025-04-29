import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import TaskForm from './TaskForm';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { motion } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  Fade,
  Backdrop,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { styled } from '@mui/system';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { BASE_URL } from '../utils/constant';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Custom AppBar with gradient
const GradientAppBar = styled(AppBar)({
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
});

// Modal style
const ModalBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
  borderRadius: '15px',
  boxShadow: '5px 5px 15px #d1d1d1, -5px -5px 15px #ffffff',
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

// Style for the stats chip container
const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    gap: theme.spacing(0.5),
  },
}));

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterUser, setFilterUser] = useState('ALL');
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTask, setEditTask] = useState({ title: '', description: '', status: 'TODO', dueDate: '', userId: '' });
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { token, setToken, user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !token) return;

    const fetchData = async () => {
      try {
        // Fetch tasks
        const taskResponse = await axios.get(`${BASE_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Tasks:', taskResponse.data);
        setTasks(taskResponse.data);
        setFilteredTasks(taskResponse.data);

        // Fetch users if admin
        console.log('User:', user);
        if (user?.role === 'admin') {
          const userResponse = await axios.get(`${BASE_URL}/auth/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Users:', userResponse.data);
          setUsers(userResponse.data);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          setToken(null);
          navigate('/login');
        } else if (err.response?.status === 403) {
          setUsers([]);
        }
      }
    };
    fetchData();
  }, [token, navigate, setToken, user, authLoading]);

  useEffect(() => {
    let tempTasks = tasks;
    if (filterStatus !== 'ALL') {
      tempTasks = tempTasks.filter((task) => task.status === filterStatus);
    }
    if (filterUser !== 'ALL') {
      tempTasks = tempTasks.filter((task) => task.user?._id === filterUser);
    }
    setFilteredTasks(tempTasks);
  }, [filterStatus, filterUser, tasks]);

  const handleOpenCreateModal = () => setOpenCreateModal(true);
  const handleCloseCreateModal = () => setOpenCreateModal(false);

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setEditTask({
      title: task.title,
      description: task.description || '',
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      userId: task.user?._id || '',
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedTask(null);
    setEditTask({ title: '', description: '', status: 'TODO', dueDate: '', userId: '' });
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedTask = {
        title: editTask.title,
        description: editTask.description,
        status: editTask.status,
        dueDate: editTask.dueDate || null,
      };
      if (user?.role === 'admin') {
        updatedTask.userId = editTask.userId;
      }
      const endpoint = user?.role === 'admin'
        ? `${BASE_URL}/admin/tasks/${selectedTask._id}`
        : `${BASE_URL}/tasks/${selectedTask._id}`;
      const response = await axios.put(endpoint, updatedTask, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.map((task) => (task._id === selectedTask._id ? response.data : task)));
      handleCloseEditModal();
    } catch (err) {
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (task) => {
    setSelectedTask(task);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === 'admin'
        ? `${BASE_URL}/admin/tasks/${selectedTask._id}`
        : `${BASE_URL}/tasks/${selectedTask._id}`;
      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== selectedTask._id));
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Task statistics for chips and charts
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((task) => task.status === 'IN PROGRESS').length;
  const completedTasks = tasks.filter((task) => task.status === 'CLOSED').length;

  const barChartData = {
    labels: ['Total Tasks', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Task Counts',
        data: [totalTasks, inProgressTasks, completedTasks],
        backgroundColor: [
          'rgba(33, 150, 243, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(76, 175, 80, 0.6)',
        ],
        borderColor: [
          'rgba(33, 150, 243, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(76, 175, 80, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Task Statistics (Bar)' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Count' } },
    },
  };

  const pieChartData = {
    labels: ['TODO', 'IN PROGRESS', 'CLOSED'],
    datasets: [
      {
        data: [
          tasks.filter((task) => task.status === 'TODO').length,
          tasks.filter((task) => task.status === 'IN PROGRESS').length,
          tasks.filter((task) => task.status === 'CLOSED').length,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Task Status Distribution (Pie)' },
    },
  };

  // Custom function to format date as DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (authLoading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GradientAppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Task Manager Dashboard
          </Typography>
          <Button
            color="inherit"
            onClick={() => {
              setToken(null);
              navigate('/login');
            }}
            startIcon={<LogoutIcon />}
            sx={{
              borderRadius: '20px',
              padding: '8px 16px',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </GradientAppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Dashboard Overview
        </Typography>

        {/* Replace StatCards with Chips */}
        <StatsContainer>
          <Chip
            label={`Total Tasks: ${totalTasks}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
          <Chip
            label={`In Progress: ${inProgressTasks}`}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
          <Chip
            label={`Completed: ${completedTasks}`}
            color="success"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        </StatsContainer>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ maxWidth: 400, mx: 'auto' }}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </Box>
          </Grid>
        </Grid>

        <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 4 }}>
          <Tab label="Tasks" />
          {user?.role === 'admin' && <Tab label="Users" />}
        </Tabs>

        {tabValue === 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Your Tasks
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Filter by Status"
                    startAdornment={<FilterListIcon sx={{ mr: 1, color: 'action' }} />}
                  >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="TODO">TODO</MenuItem>
                    <MenuItem value="IN PROGRESS">IN PROGRESS</MenuItem>
                    <MenuItem value="CLOSED">CLOSED</MenuItem>
                  </Select>
                </FormControl>
                {user?.role === 'admin' && (
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Filter by User</InputLabel>
                    <Select
                      value={filterUser}
                      onChange={(e) => setFilterUser(e.target.value)}
                      label="Filter by User"
                    >
                      <MenuItem value="ALL">All Users</MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user._id} value={user._id}>{user.username}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography fontWeight="bold">Title</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Description</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Due Date</Typography></TableCell>
                    {user?.role === 'admin' && <TableCell><Typography fontWeight="bold">User</Typography></TableCell>}
                    <TableCell><Typography fontWeight="bold">Actions</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={user?.role === 'admin' ? 6 : 5} align="center">
                        <Typography color="textSecondary">No tasks found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.description || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={task.status}
                            color={
                              task.status === 'TODO' ? 'primary' :
                              task.status === 'IN PROGRESS' ? 'warning' :
                              'success'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(task.dueDate)}</TableCell>
                        {user?.role === 'admin' && (
                          <TableCell>
                            {task.user?.username || task.userId || '-'}
                          </TableCell>
                        )}
                        <TableCell>
                          <IconButton onClick={() => handleOpenEditModal(task)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleOpenDeleteDialog(task)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {tabValue === 1 && user?.role === 'admin' && (
          <>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              All Users
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Typography fontWeight="bold">Username</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Email</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Role</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Created At</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        <Fab
          color="primary"
          aria-label="add"
          onClick={handleOpenCreateModal}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <AddIcon />
        </Fab>

        <Modal
          open={openCreateModal}
          onClose={handleCloseCreateModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={openCreateModal}>
            <ModalBox>
              <Typography variant="h6" align="center" gutterBottom>
                Create New Task
              </Typography>
              <TaskForm
                setTasks={setTasks}
                token={token}
                onTaskAdded={handleCloseCreateModal}
              />
            </ModalBox>
          </Fade>
        </Modal>

        <Modal
          open={openEditModal}
          onClose={handleCloseEditModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={openEditModal}>
            <ModalBox>
              <Typography variant="h6" align="center" gutterBottom>
                Edit Task
              </Typography>
              <Box component="form" onSubmit={handleEditTask}>
                <TextField
                  fullWidth
                  label="Task Title"
                  value={editTask.title}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={editTask.description}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editTask.status}
                    onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="TODO">TODO</MenuItem>
                    <MenuItem value="IN PROGRESS">IN PROGRESS</MenuItem>
                    <MenuItem value="CLOSED">CLOSED</MenuItem>
                  </Select>
                </FormControl>
                {user?.role === 'admin' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Assign to User</InputLabel>
                    <Select
                      value={editTask.userId}
                      onChange={(e) => setEditTask({ ...editTask, userId: e.target.value })}
                      label="Assign to User"
                      required
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
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={editTask.dueDate}
                  onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button onClick={handleCloseEditModal} color="secondary">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </Box>
              </Box>
            </ModalBox>
          </Fade>
        </Modal>

        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the task "{selectedTask?.title}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteTask}
              color="error"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </motion.div>
  );
};

export default Dashboard;