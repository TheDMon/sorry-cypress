import { Error, Info, Warning } from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from '@mui/material';
import React, { FunctionComponent } from 'react';

export const AlertModal: AlertModalComponent = (props) => {
  const { onClose, open, title, message, type } = props;

  const handleClose = () => {
    onClose();
  };

  const iconElement =
    type === AlertType.Information ? (
      <Info fontSize="large" color="primary" />
    ) : type === AlertType.Success ? (
      <Info fontSize="large" color="success" />
    ) : type === AlertType.Warning ? (
      <Warning fontSize="large" color="error" />
    ) : (
      <Error fontSize="large" color="error" />
    );

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Grid container alignItems="center" spacing={1}>
          <Grid item>{iconElement}</Grid>
          <Grid item xs>
            <DialogContentText id="delete-run-dialog-description">
              {message}
            </DialogContentText>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type AlertModalProps = {
  onClose: () => void;
  open: boolean;
  title: string;
  message: string;
  type: AlertType;
};
type AlertModalComponent = FunctionComponent<AlertModalProps>;

export enum AlertType {
  Success = 'Success',
  Information = 'Information',
  Error = 'Error',
  Warning = 'Warning',
}
