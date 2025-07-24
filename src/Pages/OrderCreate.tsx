/**
 * Order create page which calls OrderInfo, OrderLine, and OrderHistory components
 * Broken into steps:
 * Step 1: Order Info
 * Step 2: Order Lines and History
 */
import { useState } from 'react';
import OrderInfo, { requiredFields } from '../Components/OrderInfo';
import OrderLine from '../Components/OrderLine';
import OrderHistory from '../Components/OrderHistory';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

export default function OrderCreate() {
  // State for order info, lines, and history
  const [orderInfo, setOrderInfo] = useState({
    orderNumber: '',
    customer: '',
    transactionDate: '',
    status: '',
    fromLocation: '',
    toLocation: '',
    pendingApprovalReasonCode: [],
    supportRep: '',
    incoterm: '',
    freightTerms: '',
    totalShipUnitCount: '',
    totalQuantity: '',
    discountRate: '',
    billingAddress: '',
    shippingAddress: '',
    earlyPickupDate: '',
    latePickupDate: '',
    useShippingAsBilling: false,
  });
  const [orderLines, setOrderLines] = useState<readonly any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Step navigation handlers
  const handleNext = () => setStep((s) => Math.min(s + 1, 1));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));

  // Save order to JSON server
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const order = { ...orderInfo, lines: orderLines, history: orderHistory };
      const res = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error('Failed to save order');
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  // Validate required fields
  const isOrderInfoValid = requiredFields.every((key) => {
    const value = orderInfo[key as keyof typeof orderInfo];
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  });

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', pt: 0, px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Steps */}
      {step === 0 && (
        <Box sx={{ width: 1, minWidth: 0 }}>
          <OrderInfo fields={orderInfo} setFields={setOrderInfo} />
        </Box>
      )}
      {step === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: 1, minWidth: 0 }}>
          <Box sx={{ width: 1, minWidth: 0 }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                Order Lines
              </Typography>
            </Box>
            <OrderLine rows={orderLines} setRows={setOrderLines} />
          </Box>
          <Divider sx={{ my: 4 }} />
          <Box sx={{ width: 1, minWidth: 0 }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                Order History
              </Typography>
            </Box>
            <OrderHistory
              rows={orderHistory as readonly any[]}
              setRows={setOrderHistory as React.Dispatch<React.SetStateAction<readonly any[]>>}
              readOnly={false}
            />
          </Box>
        </Box>
      )}

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Button
          variant="contained"
          color="inherit"
          disabled={step === 0}
          onClick={handlePrev}
        >
          Previous
        </Button>
        {step === 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Order'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={step === 1 || !isOrderInfoValid}
          >
            Next
          </Button>
        )}
      </Box>

      {/* Alerts  */}
      {success && <Alert severity="success" sx={{ mt: 2 }}>Order created successfully!</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
}