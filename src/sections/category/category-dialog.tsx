// src/sections/expense/expense-dialog.tsx

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Snackbar from '@mui/material/Snackbar';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import axiosInstance from 'src/utils/axios';

import type { CategoryProps } from './category-table-row';

// ----------------------------------------------------------------------



type CategoryDialogProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentCategory?: CategoryProps;
};

export function CategoryDialog({ open, onClose, onUpdate, currentCategory }: CategoryDialogProps) {
  const getInitialFormData = useCallback(() => ({
    category_name: '',
    category_type: '',
    category_detail_type: '',
    is_active: false,
    
  }), []);

  const [formData, setFormData] = useState(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (open) {
        if (currentCategory) {
          setFormData({
            category_name: currentCategory.category_name,
            category_type: currentCategory.category_type,
            category_detail_type: currentCategory.category_detail_type,
            is_active: currentCategory.is_active,
          });
        } else {
          setFormData(getInitialFormData());
        }
        
      }
    };
    fetchDropdownData();
  }, [open, currentCategory, getInitialFormData]);

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        console.log('Submitting form data:', formData);
      const accessToken = localStorage.getItem('accessToken');

      if (currentCategory) {
        await axiosInstance.put(`categories/list/${currentCategory.category_id}/`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSnackbar({ open: true, message: 'Category updated successfully!', severity: 'success' });
      } else {
        await axiosInstance.post('categories/list/', formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSnackbar({ open: true, message: 'Category added successfully!', severity: 'success' });
      }

      onUpdate();
      onClose();
      setFormData(getInitialFormData());
      // Reset form or handle success feedback here
    } catch (error: any) {
      console.error('Failed to add category:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to add category',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{currentCategory ? 'Edit Category' : 'New Category'}</DialogTitle>

      <DialogContent>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 1,
          }}
        >
          <TextField
            label="Category Name"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            select
            label="Category Type"
            name="category_type"
            value={formData.category_type}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem key='expense' value='expense'>Expense</MenuItem>
            <MenuItem key='income' value='income'>Income</MenuItem>
            <MenuItem key='transfer' value='transfer'>Transfer</MenuItem>
              
          </TextField>

          <TextField
            select
            label="Category Detail Type"
            name="category_detail_type"
            value={formData.category_detail_type}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem key='essential' value='essential'>Essential</MenuItem>
            <MenuItem key='discretionary' value='discretionary'>Discretionary</MenuItem>
            
          </TextField>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_active}
                onChange={handleChange}
                name="is_active"
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <LoadingButton onClick={handleSubmit} variant="contained" loading={isSubmitting}>
          {currentCategory ? 'Update' : 'Add'}
        </LoadingButton>
      </DialogActions>
    </Dialog>

    <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
