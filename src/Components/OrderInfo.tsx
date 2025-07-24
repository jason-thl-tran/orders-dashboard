/**
 * Order basic information component
 */
import React, { useState } from 'react';
import Grid from '@mui/material/Grid'; // <-- Only this import for Grid!
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText,
  Typography,
  Box,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

const statusOptions = ['Pending', 'Approved','Shipped', 'Cancelled'];
const fromLocationOptions = ['Warehouse A', 'Warehouse B', 'Warehouse C','Warehouse D'];
const incotermOptions = ['EXW', 'FOB', 'CIF','DDP','DAP'];
const freightTermsOptions = ['Prepaid', 'Collect'];
const pendingApprovalReasonCodes = ['PRICE_DISCREPANCY ', 'CREDIT_HOLD', 'STOCK_SHORTAGE', 'CUSTOMER_REQUEST'];

export const requiredFields = [
  'orderNumber',
  'customer',
  'transactionDate',
  'status',
  'fromLocation',
  'toLocation',
] as const;

export default function OrderInfo({ fields, setFields, readOnly = false }: { fields: any, setFields: (fields: any) => void, readOnly?: boolean }) {
  //states for validation and touched fields
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const handleBlur = (field: string) => setTouched({ ...touched, [field]: true });

  // Incoterm/Freight Terms mutual exclusion
  const handleIncotermChange = (e: SelectChangeEvent) => {
    setFields({ ...fields, incoterm: e.target.value as string, freightTerms: '' });
  };
  const handleFreightTermsChange = (e: SelectChangeEvent) => {
    setFields({ ...fields, freightTerms: e.target.value as string, incoterm: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (event: SelectChangeEvent<any>) => {
    const { name, value } = event.target;
    setFields({
      ...fields,
      [name as string]: name === 'pendingApprovalReasonCode'
        ? typeof value === 'string'
          ? value.split(',')
          : value
        : value,
    });
  };

  const isRequired = (field: string) => (requiredFields as readonly string[]).includes(field);

  const isIncotermOrFreightTermsRequired =
    !fields.incoterm && !fields.freightTerms;

  return (
    <Box sx={{ width: 1, minWidth: 0 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Order Information
        </Typography>
        <Grid
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
          }}
        >
          
          {/* Order Number */}
          <Box sx={{ gridColumn: { xs: '1', sm: '1', md: '1' } }}>
            <TextField
              required={isRequired('orderNumber')}
              label="Order Number"
              name="orderNumber"
              value={fields.orderNumber}
              onChange={handleChange}
              onBlur={() => handleBlur('orderNumber')}
              error={touched.orderNumber && !fields.orderNumber}
              helperText={touched.orderNumber && !fields.orderNumber ? 'Required' : ''}
              fullWidth
              slotProps={{ input: { readOnly } }}
              disabled={readOnly}
            />
          </Box>

          {/* Customer */}
          <Box>
            <TextField
              required={isRequired('customer')}
              label="Customer"
              name="customer"
              value={fields.customer}
              onChange={handleChange}
              onBlur={() => handleBlur('customer')}
              error={touched.customer && !fields.customer}
              helperText={touched.customer && !fields.customer ? 'Required' : ''}
              fullWidth
              slotProps={{ input: { readOnly } }}
              disabled={readOnly}
            />
          </Box>

          {/* Status */}
          <Box>
            <FormControl required={isRequired('status')} fullWidth error={touched.status && !fields.status} sx={{ minWidth: 220 }}>
              <InputLabel shrink>Status</InputLabel>
              <Select
                name="status"
                value={fields.status}
                label="Status"
                onChange={handleSelectChange}
                onBlur={() => handleBlur('status')}
                displayEmpty
                disabled={readOnly}
              >
                <MenuItem value="">Select...</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
              {touched.status && !fields.status && <FormHelperText>Required</FormHelperText>}
            </FormControl>
          </Box>

          {/* Transaction Date */}
          <Box>
            <TextField
              required={isRequired('transactionDate')}
              label="Transaction Date"
              name="transactionDate"
              type="date"
              value={fields.transactionDate}
              onChange={handleChange}
              onBlur={() => handleBlur('transactionDate')}
              error={touched.transactionDate && !fields.transactionDate}
              helperText={touched.transactionDate && !fields.transactionDate ? 'Required' : ''}
              fullWidth
              slotProps={{ input: { readOnly }, inputLabel: { shrink: true } }}
              disabled={readOnly}
            />
          </Box>

          {/* From Location */}
          <Box>
            <FormControl required={isRequired('fromLocation')} fullWidth error={touched.fromLocation && !fields.fromLocation} sx={{ minWidth: 220 }}>
              <InputLabel shrink>From Location</InputLabel>
              <Select
                name="fromLocation"
                value={fields.fromLocation}
                label="From Location"
                onChange={handleSelectChange}
                onBlur={() => handleBlur('fromLocation')}
                displayEmpty
                disabled={readOnly}
              >
                <MenuItem value="">Select...</MenuItem>
                {fromLocationOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
              {touched.fromLocation && !fields.fromLocation && <FormHelperText>Required</FormHelperText>}
            </FormControl>
          </Box>

          {/* To Location */}
          <Box>
            <TextField
              required={isRequired('toLocation')}
              label="To Location"
              name="toLocation"
              value={fields.toLocation}
              onChange={handleChange}
              onBlur={() => handleBlur('toLocation')}
              error={touched.toLocation && !fields.toLocation}
              helperText={touched.toLocation && !fields.toLocation ? 'Required' : ''}
              fullWidth
              slotProps={{ input: { readOnly } }}
              disabled={readOnly}
            />
          </Box>

          {/* Pending Approval Reason Code */}
          <Box>
            <FormControl fullWidth sx={{ minWidth: 240 }}>
              <InputLabel shrink>Pending Approval Reason Code</InputLabel>
              <Select
                multiple
                name="pendingApprovalReasonCode"
                value={fields.pendingApprovalReasonCode}
                onChange={handleSelectChange}
                input={<OutlinedInput label="Pending Approval Reason Code" />}
                renderValue={(selected) =>
                  (selected as string[]).length === 0 ? 'Select...' : (selected as string[]).join(', ')
                }
                displayEmpty
                label="Pending Approval Reason Code"
                disabled={readOnly}
              >
                <MenuItem disabled value="">Select...</MenuItem>
                {pendingApprovalReasonCodes.map((option) => (
                  <MenuItem key={option} value={option}>
                    <Checkbox checked={fields.pendingApprovalReasonCode.indexOf(option) > -1} disabled={readOnly} />
                    <ListItemText primary={option} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Incoterm */}
          <Box>
            <FormControl required={isIncotermOrFreightTermsRequired} fullWidth error={isIncotermOrFreightTermsRequired && !fields.incoterm && !fields.freightTerms}>
              <InputLabel shrink>Incoterm</InputLabel>
              <Select
                name="incoterm"
                value={fields.incoterm}
                label="Incoterm"
                onChange={handleIncotermChange}
                disabled={!!fields.freightTerms || readOnly}
                displayEmpty
              >
                <MenuItem value="">Select...</MenuItem>
                {incotermOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
              {isIncotermOrFreightTermsRequired && !fields.incoterm && !fields.freightTerms && (
                <FormHelperText>Incoterm or Freight Terms required</FormHelperText>
              )}
            </FormControl>
          </Box>

          {/* Freight Terms */}
          <Box>
            <FormControl required={isIncotermOrFreightTermsRequired} fullWidth error={isIncotermOrFreightTermsRequired && !fields.incoterm && !fields.freightTerms}>
              <InputLabel shrink>Freight Terms</InputLabel>
              <Select
                name="freightTerms"
                value={fields.freightTerms}
                label="Freight Terms"
                onChange={handleFreightTermsChange}
                disabled={!!fields.incoterm || readOnly}
                displayEmpty
              >
                <MenuItem value="">Select...</MenuItem>
                {freightTermsOptions.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
              {isIncotermOrFreightTermsRequired && !fields.incoterm && !fields.freightTerms && (
                <FormHelperText>Incoterm or Freight Terms required</FormHelperText>
              )}
            </FormControl>
          </Box>

          {/* Total Ship Unit Count */}
          <Box>
            <TextField
              label="Total Ship Unit Count"
              name="totalShipUnitCount"
              type="number"
              value={fields.totalShipUnitCount}
              onChange={handleChange}
              fullWidth
              slotProps={{ input: { readOnly } }}
              disabled={readOnly}
            />
          </Box>

          {/* Total Quantity */}
          <Box>
            <TextField
              label="Total Quantity"
              name="totalQuantity"
              type="number"
              value={fields.totalQuantity}
              onChange={handleChange}
              fullWidth
              slotProps={{ input: { readOnly } }}
              disabled={readOnly}
            />
          </Box>

          {/* Discount Rate */}
          <Box>
            <TextField
              label="Discount Rate"
              name="discountRate"
              value={fields.discountRate}
              onChange={handleChange}
              fullWidth
              slotProps={{ input: { readOnly, inputMode: 'decimal' } }}
              InputProps={{
                endAdornment: <span style={{ color: '#888', marginLeft: 4 }}>%</span>
              }}
              disabled={readOnly}
            />
          </Box>

          {/* Divider above Shipping Address */}
          <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 3', md: '1 / span 3' } }}>
            <hr style={{ border: 0, borderTop: '1px solid #ccc', margin: '16px 0' }} />
          </Box>

          {/* Shipping Address */}
          <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 3', md: '1 / span 3' } }}>
            <TextField
              label="Shipping Address"
              name="shippingAddress"
              value={fields.shippingAddress}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              slotProps={{ input: { readOnly } }}
              disabled={readOnly}
            />
          </Box>

          {/* Use Shipping as Billing Checkbox */}
          <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 3', md: '1 / span 3' }, display: 'flex', alignItems: 'center', mb: -1, pl: 3 }}>
            <Checkbox
              checked={fields.useShippingAsBilling || false}
              onChange={e => setFields({ ...fields, useShippingAsBilling: e.target.checked })}
              id="useShippingAsBilling"
              disabled={readOnly}
            />
            <label htmlFor="useShippingAsBilling">Use this address as Billing address</label>
          </Box>

          {/* Billing Address (conditionally rendered) */}
          {!fields.useShippingAsBilling && (
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 3', md: '1 / span 3' } }}>
              <TextField
                label="Billing Address"
                name="billingAddress"
                value={fields.billingAddress}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
                slotProps={{ input: { readOnly } }}
                disabled={readOnly}
              />
            </Box>
          )}

          {/* Early Pickup Date */}
          <Box>
            <TextField
              label="Early Pickup Date"
              name="earlyPickupDate"
              type="date"
              value={fields.earlyPickupDate}
              onChange={handleChange}
              fullWidth
              slotProps={{ input: { readOnly }, inputLabel: { shrink: true } }}
              disabled={readOnly}
            />
          </Box>

          {/* Late Pickup Date */}
          <Box>
            <TextField
              label="Late Pickup Date"
              name="latePickupDate"
              type="date"
              value={fields.latePickupDate}
              onChange={handleChange}
              fullWidth
              slotProps={{ input: { readOnly }, inputLabel: { shrink: true } }}
              disabled={readOnly}
            />
          </Box>

          {/* Support Rep */}
          <Box>
            <TextField
              label="Support Rep"
              name="supportRep"
              value={fields.supportRep}
              onChange={handleChange}
              fullWidth
              slotProps={{ input: { readOnly } }}
              disabled={readOnly}
            />
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}