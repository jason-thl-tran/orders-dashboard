/**
 *  Componenet for adding or vieing an orders lines, mostly the same as order history but different fields
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { DataGrid, GridActionsCellItem, GridRowModes, GridRowEditStopReasons } from '@mui/x-data-grid';
import type {
  GridRowsProp,
  GridRowModesModel,
  GridColDef,
  GridEventListener,
  GridRowId,
  GridRowModel,
} from '@mui/x-data-grid';

//random id generator
function randomId() {
  return Math.random().toString(36).substr(2, 9);
}

//Props for the EditToolbar component, which allows adding new history events
interface EditToolbarProps {
  setRows: React.Dispatch<React.SetStateAction<GridRowsProp>>;
  setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
}

//add button that generates unique id and row,sets row in edit mode
function EditToolbar({ setRows, setRowModesModel }: EditToolbarProps) {
  const handleClick = () => {
    const id = randomId();
    setRows((oldRows: GridRowsProp) => [
      ...oldRows,
      { id, item: 'Item name', units: '0', quantity: 0, price: 0, amount: 0, isNew: true },
    ]);
    setRowModesModel((oldModel: GridRowModesModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'item' },
    }));
  };

  return (
    <Box sx={{ p: 1 }}>
      <Tooltip title="Add line">
        <Button onClick={handleClick} startIcon={<AddIcon fontSize="small" />}>
          Add Line
        </Button>
      </Tooltip>
    </Box>
  );
}


export default function OrderLine({ rows, setRows, readOnly = false }: { rows: readonly any[]; setRows: React.Dispatch<React.SetStateAction<readonly any[]>>; readOnly?: boolean }) {
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  //Prevents row from exiting edit mode on focus out
  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  //Sets a row to edit mode
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  //Sets a row to view mode and updates database
  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  //Removes row
  const handleDeleteClick = (id: GridRowId) => () => {
    setRows((prevRows) => prevRows.filter((row: any) => row.id !== id));
  };

  //Cancels editing and reverts changes or removes new row
  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row: any) => row.id === id);
    if (editedRow && editedRow.isNew) {
      setRows((prevRows) => prevRows.filter((row: any) => row.id !== id));
    }
  };

  //Updates the parent rows state with the edited row
  const processRowUpdate = (newRow: GridRowModel, _oldRow: GridRowModel) => {
    const q = typeof newRow.quantity === 'number' ? newRow.quantity : Number(newRow.quantity) || 0;
    const p = typeof newRow.price === 'number' ? newRow.price : Number(newRow.price) || 0;
    const amount = q * p;
    const updatedRow = { ...newRow, amount, isNew: false };
    setRows((prevRows: readonly any[]) => prevRows.map((row: any) => (row && 'id' in row && 'id' in updatedRow && row.id === updatedRow.id ? updatedRow : row)));
    return updatedRow;
  };

  //Updates the rowModesModel state
  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  //Defines columns
  const columns: GridColDef[] = [
    {
      field: 'item',
      headerName: 'Item',
      type: 'string',
      flex: 2,
      editable: !readOnly,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'units',
      headerName: 'Units',
      type: 'number',
      flex: 1,
      editable: !readOnly,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      type: 'number',
      flex: 1, editable: !readOnly, headerAlign: 'center', align: 'center',
    },
    {
      field: 'price',
      headerName: 'Price',
      type: 'number',
      flex: 1, editable: !readOnly, headerAlign: 'center', align: 'center',
    },
    {
      field: 'amount',
      headerName: 'Amount',
      type: 'number',
      flex: 1, editable: false, headerAlign: 'center', align: 'center',
      //Shows the calculated amount
      renderCell: (params: { row: any }) => {
        const row = params?.row;
        const q = typeof row?.quantity === 'number' ? row.quantity : Number(row?.quantity) || 0;
        const p = typeof row?.price === 'number' ? row.price : Number(row?.price) || 0;
        if (isNaN(q) || isNaN(p)) return 0;
        return (q * p).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
      },
    },
    //Actions column
    ...(!readOnly ? [{
      field: 'actions',
      type: 'actions' as const,
      headerName: 'Actions',
      flex: 0.7,
      cellClassName: 'actions',
      getActions: ({ id }: { id: GridRowId }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }
        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    }] : [])
  ];

  return (
    <Box sx={{ width: 1, minWidth: 0 }}>
      <Box
        sx={{
          width: 900,
          mx: 'auto',
          minWidth: 0,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: 400,
          position: 'relative',
          pr: 0,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          showToolbar={false}
          sx={{
            minWidth: 0,
            width: 900,
            mx: 'auto',
            boxSizing: 'border-box',
            px: 1, 
          }}
          disableColumnMenu={readOnly}
          disableRowSelectionOnClick={readOnly}
          hideFooter={readOnly}
        />
        {!readOnly && (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
            <EditToolbar setRows={setRows} setRowModesModel={setRowModesModel} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

