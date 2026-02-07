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

import type { VendorProps } from './vendor-table-row';

// ----------------------------------------------------------------------

type CategoryOption = {
  category_id: string;
  category_name: string;
  category_type: string;
  category_detail_type: string;
  is_active: boolean;
};

type VendorDialogProps = {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentVendor?: VendorProps;
};

export function VendorDialog({ open, onClose, onUpdate, currentVendor }: VendorDialogProps) {
  const getInitialFormData = useCallback(() => ({
    vendor_name: '',
    vendor_type: '',
    default_category_id: '',
    is_active: false,
    
  }), []);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
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
        if (currentVendor) {
          setFormData({
            vendor_name: currentVendor.vendor_name,
            vendor_type: currentVendor.vendor_type,
            default_category_id: currentVendor.default_category.category_id,
            is_active: currentVendor.is_active,
          });
        } else {
          setFormData(getInitialFormData());
        }

        try {
          const accessToken = localStorage.getItem('accessToken');
          const config = {
            headers: { Authorization: `Bearer ${accessToken}` },
          };

          const [categoriesRes ] =
            await Promise.all([
              axiosInstance.get('categories/list', config)
            ]);
          console.log(JSON.stringify(categoriesRes.data));
          

          setCategories(categoriesRes.data.results || categoriesRes.data || []);
          
        } catch (error) {
          console.error('Failed to fetch dropdown data:', error);
        }
        
      }
    };
    fetchDropdownData();
  }, [open, currentVendor, getInitialFormData]);

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

      if (currentVendor) {
        await axiosInstance.put(`categories/vendors/${currentVendor.vendor_id}/`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSnackbar({ open: true, message: 'Vendor updated successfully!', severity: 'success' });
      } else {
        await axiosInstance.post('categories/vendors/', formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSnackbar({ open: true, message: 'Vendor added successfully!', severity: 'success' });
      }

      onUpdate();
      onClose();
      setFormData(getInitialFormData());
      // Reset form or handle success feedback here
    } catch (error: any) {
      console.error('Failed to save vendor:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.detail || 'Failed to add vendor',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{currentVendor ? 'Edit Vendor' : 'New Vendor'}</DialogTitle>

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
            label="Vendor Name"
            name="vendor_name"
            value={formData.vendor_name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            select
            label="Vendor Type"
            name="vendor_type"
            value={formData.vendor_type}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem key='online' value='online'>Online</MenuItem>
            <MenuItem key='offline' value='offline'>Offline</MenuItem>  
          </TextField>

          <TextField
            select
            label="Default Category"
            name="default_category_id"
            value={formData.default_category_id}
            onChange={handleChange}
            fullWidth
            >
            {categories.map((option) => (
              <MenuItem key={option.category_id} value={option.category_id}>
                {option.category_name} 
              </MenuItem>
            ))}
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
          {currentVendor ? 'Update' : 'Add'}
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
