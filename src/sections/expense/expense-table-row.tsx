import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type AccountProps = {
  account_id: string;
  account_name: string;
  account_type: string;
  bank_name: string;
};

export type CategoryProps = {
  category_id: string;
  category_name: string;
  category_type: string;
  category_detail_type: string;
};

export type PaymentMethodProps = {
  payment_method_id: string;
  method_name: string;
  provider: string;
};

export type ExpenseProps = {
  expense_id: string;
  account: AccountProps;
  category: CategoryProps;
  payment_method: PaymentMethodProps;
  vendor?: {
    vendor_id: string;
    vendor_name: string;
  };
  total_amount: number;
  expense_date: string;
  is_recurring: boolean;
  notes?: string;
};

type ExpenseTableRowProps = {
  row: ExpenseProps;
  selected: boolean;
  onEditRow: (row: ExpenseProps) => void;
  onDeleteRow: () => void;
  onSelectRow: () => void;
};

export function ExpenseTableRow({ row, selected, onEditRow, onDeleteRow, onSelectRow }: ExpenseTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell>{row.account.account_name}</TableCell>

        <TableCell>{row.category.category_name}</TableCell>

        <TableCell>{row.payment_method.method_name}</TableCell>

        <TableCell>{row.total_amount}</TableCell>
        <TableCell>{row.expense_date}</TableCell>

        <TableCell align="center">
          {row.is_recurring ? (
            <Iconify width={22} icon="eva:checkmark-fill" sx={{ color: 'success.main' }} />
          ) : (
            '-'
          )}
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={() => {
            onEditRow(row);
            handleClosePopover();
          }}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem onClick={() => {
            onDeleteRow();
            handleClosePopover();
          }} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
