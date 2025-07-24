/**
 * Order history componenet allows users to view and add history for an order
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

//randomID generator
function randomId() {
  return Math.random().toString(36).slice(2, 11);
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
      { id, event: '', timestamp: '', isNew: true },
    ]);
    // Set the new row into edit mode, focusing the 'event' field
    setRowModesModel((oldModel: GridRowModesModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'event' },
    }));
  };
  return (
    <Box sx={{ p: 1 }}>
      <Tooltip title="Add event">
        <Button onClick={handleClick} startIcon={<AddIcon fontSize="small" />}>
          Add Event
        </Button>
      </Tooltip>
    </Box>
  );
}

export default function OrderHistory({ rows, setRows, readOnly = false }: { rows: readonly any[]; setRows: React.Dispatch<React.SetStateAction<readonly any[]>>; readOnly?: boolean }) {
  //state fir setting row mode
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  //Prevents row from exiting edit mode on focus out
  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  //sets a row to edit mode
  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  //Sets a row to view mode and updates database
  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    const updatedRow = rows.find((row: any) => row.id === id);
    if (!updatedRow) return;
    fetch(`http://localhost:3001/orders/${updatedRow.orderId || updatedRow.orderNumber || ''}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: rows.map((row: any) => ({ ...row, isNew: false })) })
      }
    );
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
    const updatedRow = { ...newRow, isNew: false };
    setRows((prevRows: readonly any[]) => prevRows.map((row: any) => (row && 'id' in row && 'id' in updatedRow && row.id === updatedRow.id ? updatedRow : row)));
    return updatedRow;
  };

  //Updates the rowModesModel state
  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  //Defines the columns 
  const columns: GridColDef[] = [
    {
      field: 'event',
      headerName: 'Event',
      type: 'string',
      flex: 2,
      editable: !readOnly,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      type: 'string',
      flex: 2,
      editable: !readOnly,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const value = params.value;
        if (!value) return '';
        const d = new Date(value);
        return isNaN(d.getTime()) ? value : d.toLocaleString();
      },
    },
    //actions column
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