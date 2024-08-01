import { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: theme.palette.grey[100],
}));

const CardMediaWrapper = styled(Box)({
  position: "relative",
  paddingTop: "100%",
});

const StyledCardMedia = styled(CardMedia)({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const IngredientCard = ({ name, count, image, onEdit, onDelete, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editCount, setEditCount] = useState(count);

  const handleSave = () => {
    onSave(name, editName, editCount);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(name);
    setEditCount(count);
    setIsEditing(false);
  };

  const adjustQuantity = (amount) => {
    setEditCount(Math.max(0, editCount + amount));
  };

  return (
    <StyledCard>
      <CardMediaWrapper>
        <StyledCardMedia
          component="img"
          image={
            image ||
            "https://www.electricianlicense.com/wp-content/uploads/2020/06/placeholder-img.jpg"
          }
          alt={name}
        />
      </CardMediaWrapper>
      <CardContent sx={{ flexGrow: 1 }}>
        {isEditing ? (
          <>
            <TextField
              autoFocus
              margin="dense"
              id="edit-name"
              label="Item Name"
              type="text"
              variant="outlined"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 2,
              }}
            >
              <IconButton
                onClick={() => adjustQuantity(-1)}
                disabled={editCount <= 0}
              >
                <RemoveCircleOutlineIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ mx: 2 }}>
                {editCount}
              </Typography>
              <IconButton onClick={() => adjustQuantity(1)}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h6" component="div" noWrap>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quantity: {count}
            </Typography>
          </>
        )}
      </CardContent>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 1 }}>
        {isEditing ? (
          <>
            <IconButton onClick={handleSave} size="small">
              <SaveIcon />
            </IconButton>
            <IconButton onClick={handleCancel} size="small">
              <CancelIcon />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton onClick={() => setIsEditing(true)} size="small">
              <ModeEditIcon />
            </IconButton>
            <IconButton onClick={onDelete} size="small">
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Box>
    </StyledCard>
  );
};

export default IngredientCard;
