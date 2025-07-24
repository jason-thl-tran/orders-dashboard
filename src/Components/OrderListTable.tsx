/**
 * Displays orders in MUI datagrid
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';


const statusTabs = [
  { label: 'All', value: 'All' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Shipped', value: 'Shipped' },
  { label: 'Cancelled', value: 'Cancelled' },
];

interface OrderListTableProps {
  rows: any[];
}

export default function OrderListTable({ rows }: OrderListTableProps) {
  const [status, setStatus] = React.useState('All');
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = React.useState<string | number | null>(null);
  const [deleteSuccess, setDeleteSuccess] = React.useState(false);
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  
  const pendingApprovalCodes = [
    'PRICE_DISCREPANCY',
    'CREDIT_HOLD',
    'STOCK_SHORTAGE',
    'CUSTOMER_REQUEST',
  ];
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>([]);

  // Filtering logic for table rows
  const filteredRows = React.useMemo(() => {
    let result = status === 'All' ? rows : rows.filter((row) => row.status === status);
    if (startDate) {
      result = result.filter((row) => {
        const date = row.createdDateTime || row.transactionDate;
        return date && new Date(date) >= new Date(startDate);
      });
    }
    if (endDate) {
      result = result.filter((row) => {
        const date = row.createdDateTime || row.transactionDate;
        return date && new Date(date) <= new Date(endDate);
      });
    }
    if (selectedCodes.length > 0) {
      result = result.filter((row) => {
        const codes = row.pendingApprovalReasonCode || [];
        if (Array.isArray(codes)) {
          return codes.some((c: string) => selectedCodes.includes(c.trim()));
        }
        return selectedCodes.includes((codes || '').trim());
      });
    }
    return result;
  }, [rows, status, startDate, endDate, selectedCodes]);

  // Menu handlers for row actions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, rowId: string | number) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuRowId(rowId);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuRowId(null);
  };

  //Delete order handler
  const handleDelete = async () => {
    if (!menuRowId) return;
    setLoading(true);
    setDeleteSuccess(false);
    try {
      const row = rows.find((r) => r.orderNumber === menuRowId);
      const id = row && row.id ? row.id : menuRowId;
      await fetch(`http://localhost:3001/orders/${id}`, { method: 'DELETE' });
      setDeleteSuccess(true);
      //refresh table on delete
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('orderListRefresh'));
      }
    } catch (err) {
      setError('Failed to delete order');
    } finally {
      setLoading(false);
      handleMenuClose();
    }
  };
  //View order handler
  const handleView = () => {
    if (menuRowId) {
      navigate(`/order-view/${menuRowId}`);
    }
    handleMenuClose();
  };

  //columns definitions
  const columns: GridColDef[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 70,
      sortable: false,
      renderCell: (params: { row: any }) => (
        <>
          <IconButton
            aria-label="more"
            aria-controls="order-actions-menu"
            aria-haspopup="true"
            onClick={(e) => handleMenuOpen(e, params.row.orderNumber)}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        </>
      ),
      disableColumnMenu: true,
    },
    { field: 'orderNumber', headerName: 'Order Number', width: 140, sortable: true },
    { field: 'customer', headerName: 'Customer', width: 140, sortable: true },
    {
      field: 'createdDateTime',
      headerName: 'Created Date/Time',
      width: 180,
      sortable: true,
      renderCell: (params: { row?: any }) => {
        const row = params?.row;
        if (!row) return '';
        const historyArray = Array.isArray(row.history) ? row.history : [];
        let createdTimestamp = '';
        if (historyArray.length > 0) {
          const createdEntry = historyArray.find(
            (h: any) => h && typeof h.event === 'string' && h.event.toLowerCase().includes('created')
          );
          if (createdEntry && typeof createdEntry.timestamp === 'string' && createdEntry.timestamp) {
            createdTimestamp = createdEntry.timestamp;
          } else if (historyArray[0] && typeof historyArray[0].timestamp === 'string' && historyArray[0].timestamp) {
            createdTimestamp = historyArray[0].timestamp;
          }
        }
        if (!createdTimestamp && typeof row.transactionDate === 'string' && row.transactionDate) {
          createdTimestamp = row.transactionDate;
        }
        if (createdTimestamp) {
          const date = new Date(createdTimestamp);
          return !isNaN(date.getTime()) ? date.toLocaleString() : createdTimestamp;
        }
        return '';
      },
    },
    {
      field: 'latePickupDate',
      headerName: 'Due Date',
      width: 140,
      sortable: true,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      sortable: true,
      renderCell: (params: { row?: any }) => {
        const row = params?.row;
        if (!row || !Array.isArray(row.lines)) return 0;
        const total = row.lines.reduce((sum: number, line: any) => {
          const amt = typeof line.amount === 'number' ? line.amount : parseFloat(line.amount) || 0;
          return sum + amt;
        }, 0);
        return total.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
      },
    },
    { field: 'status', headerName: 'Status', width: 120, sortable: true },
    {
      field: 'pendingApprovalReasonCode',
      headerName: 'Pending Approval Reason Code',
      width: 220,
      sortable: true,
      filterable: false,
      renderCell: (params: { row?: any }) => {
        const codes = params?.row?.pendingApprovalReasonCode;
        if (!codes || codes.length === 0) return '';
        if (Array.isArray(codes)) return codes.join(', ');
        return codes;
      },
    },
  ];

  return (
    //containers for top filters
    <Box sx={{ width: 1, minWidth: 0 }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2 }}>
        <Tabs
          value={status}
          onChange={(_, v) => setStatus(v)}
          sx={{ mb: 2 }}
        >
          {statusTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
        {deleteSuccess && <Alert severity="success" sx={{ mb: 2 }}>Order deleted successfully!</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            select
            label="Pending Approval Reason Code"
            slotProps={{
              select: {
                multiple: true,
                value: selectedCodes,
                onChange: (e: any) => {
                  const value = e.target.value;
                  setSelectedCodes(Array.isArray(value) ? value as string[] : typeof value === 'string' ? value.split(',') : []);
                },
                renderValue: (selected: any) => (selected as string[]).join(', '),
              }
            }}
            size="small"
            sx={{ minWidth: 220 }}
          >
            {pendingApprovalCodes.map((code) => (
              <MenuItem key={code} value={code}>
                <Checkbox checked={selectedCodes.indexOf(code) > -1} />
                <ListItemText primary={code} />
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Orders DataGrid */}
        
        <div style={{ height: 520, width: '100%' }}>
          <DataGrid
            rows={filteredRows.map((row, idx) => ({ id: row.orderNumber || idx, ...row }))}
            columns={columns}
            pageSizeOptions={[5, 10, 25, 100]}
            disableRowSelectionOnClick
            autoHeight={false}
            slots={{ toolbar: GridToolbar }}
            loading={loading}
          />
        </div>
        {/* Row actions menu */}
        <Menu
          id="order-actions-menu"
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleView}>View</MenuItem>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
}