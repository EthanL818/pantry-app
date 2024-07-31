"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Modal,
  TextField,
  IconButton,
  Paper,
  AppBar,
  Toolbar,
  CircularProgress,
  Snackbar,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveIcon from "@mui/icons-material/Save";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import { firestore } from "../firebase";
import {
  collection,
  getDocs,
  query,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import IngredientCard from "../components/IngredientCard";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const ModalContent = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  outline: "none",
  minWidth: 300,
  maxWidth: 600,
  maxHeight: "90vh",
  overflowY: "auto",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  backgroundColor: theme.palette.grey[100],
}));

const StyledReactMarkdown = styled(ReactMarkdown)(({ theme }) => ({
  "& h1, & h2, & h3, & h4, & h5, & h6": {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  "& ul, & ol": {
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  "& li": {
    marginBottom: theme.spacing(1),
  },
}));

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [recipe, setRecipe] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [ingredientImage, setIngredientImage] = useState({});
  const [editItem, setEditItem] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const updatePantry = async () => {
    const q = query(collection(firestore, "pantry"));
    const querySnapshot = await getDocs(q);
    const pantryList = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pantryList.push({
        name: doc.id,
        count: data.count,
        imageUrl: data.imageUrl,
      });
    });

    setPantry(pantryList);
  };

  const addItem = async () => {
    if (!newItemName.trim()) return;
    const docRef = doc(
      collection(firestore, "pantry"),
      newItemName.toLowerCase()
    );

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count, imageUrl } = docSnap.data();
      await setDoc(docRef, { count: count + newItemQuantity, imageUrl });
    } else {
      // Fetch image for new ingredient
      const imageUrl = await fetchIngredientImage(newItemName.toLowerCase());
      await setDoc(docRef, { count: newItemQuantity, imageUrl });
    }
    await updatePantry();
    setNewItemName("");
    setNewItemQuantity(1);
    setOpen(false);
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    await deleteDoc(docRef);
    await updatePantry();
  };

  const generateRecipe = async () => {
    setIsLoading(true);
    const ingredients = pantry.map(({ name }) => name);
    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recipe");
      }

      const { recipe } = await response.json();
      setRecipe(recipe);
      console.log(recipe);
      setRecipeModalOpen(true);
    } catch (error) {
      console.error("Error generating recipe:", error);
      alert("Failed to generate recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyRecipe = () => {
    navigator.clipboard.writeText(recipe).then(
      () => {
        setCopySuccess(true);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const handleCloseCopySnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setCopySuccess(false);
  };

  const fetchIngredientImage = async (ingredient) => {
    try {
      const response = await fetch(
        `/api/get-ingredient-image?ingredient=${encodeURIComponent(ingredient)}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      }
    } catch (error) {
      console.error("Error fetching ingredient image:", error);
    }
    return null;
  };

  const cancelEdit = () => {
    setEditItem(null);
  };

  const saveEdit = async () => {
    if (!editItem) return;

    // Check if new name already exists
    if (editItem.name !== editItem.originalName) {
      const existingItem = pantry.find(
        (item) => item.name.toLowerCase() === editItem.name.toLowerCase()
      );
      if (existingItem) {
        alert("An ingredient with this name already exists.");
        return;
      }
    }

    // Remove old item
    await removeItem(editItem.originalName);

    // Add new item
    const docRef = doc(
      collection(firestore, "pantry"),
      editItem.name.toLowerCase()
    );
    await setDoc(docRef, { count: editItem.count });

    // Fetch new image if name changed
    if (editItem.name !== editItem.originalName) {
      await fetchIngredientImage(editItem.name.toLowerCase());
    }

    await updatePantry();
    setEditItem(null);
  };

  const adjustQuantity = (item, amount) => {
    const newCount = Math.max(0, item.count + amount);
    setEditItem({ ...item, count: newCount });
  };

  const handleSaveEdit = async (originalName, newName, newCount) => {
    if (originalName.toLowerCase() !== newName.toLowerCase()) {
      const existingItem = pantry.find(
        (item) => item.name.toLowerCase() === newName.toLowerCase()
      );
      if (existingItem) {
        alert("An ingredient with this name already exists.");
        return;
      }
    }

    // Remove old item
    await removeItem(originalName);

    // Add new item
    const docRef = doc(collection(firestore, "pantry"), newName.toLowerCase());
    let imageUrl = pantry.find(
      (item) => item.name.toLowerCase() === originalName.toLowerCase()
    )?.imageUrl;

    if (originalName.toLowerCase() !== newName.toLowerCase()) {
      imageUrl = await fetchIngredientImage(newName.toLowerCase());
    }

    await setDoc(docRef, { count: newCount, imageUrl });

    await updatePantry();
  };

  useEffect(() => {
    updatePantry();
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RecipeCrafter
          </Typography>
          <Button
            color="inherit"
            onClick={generateRecipe}
            startIcon={<ReceiptLongIcon />}
            sx={{ mr: 2 }}
            disabled={isLoading || pantry.length === 0}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Generate Recipe"
            )}
          </Button>
          <Button
            color="inherit"
            onClick={() => setOpen(true)}
            startIcon={<AddIcon />}
          >
            Add Item
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          {pantry.map(({ name, count, imageUrl }) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={name}>
              <IngredientCard
                name={name}
                count={count}
                image={imageUrl}
                onSave={handleSaveEdit}
                onDelete={() => removeItem(name)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
      <StyledModal
        open={editItem !== null}
        onClose={cancelEdit}
        aria-labelledby="edit-item-modal"
      >
        <ModalContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Edit Item
          </Typography>
          {editItem && (
            <>
              <TextField
                autoFocus
                margin="dense"
                id="edit-name"
                label="Item Name"
                type="text"
                fullWidth
                variant="outlined"
                value={editItem.name}
                onChange={(e) =>
                  setEditItem({ ...editItem, name: e.target.value })
                }
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
                  onClick={() => adjustQuantity(editItem, -1)}
                  disabled={editItem.count <= 0}
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ mx: 2 }}>
                  {editItem.count}
                </Typography>
                <IconButton onClick={() => adjustQuantity(editItem, 1)}>
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={cancelEdit}>Cancel</Button>
                <Button onClick={saveEdit} variant="contained" sx={{ ml: 1 }}>
                  Save
                </Button>
              </Box>
            </>
          )}
        </ModalContent>
      </StyledModal>
      <StyledModal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="add-item-modal"
      >
        <ModalContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Add New Item
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Item Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          <TextField
            margin="dense"
            id="quantity"
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={newItemQuantity}
            onChange={(e) =>
              setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            InputProps={{ inputProps: { min: 1 } }}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={addItem} variant="contained" sx={{ ml: 1 }}>
              Add
            </Button>
          </Box>
        </ModalContent>
      </StyledModal>
      <StyledModal
        open={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        aria-labelledby="recipe-modal"
      >
        <ModalContent>
          <Typography variant="h6" component="h2" gutterBottom>
            Generated Recipe
          </Typography>
          <Box sx={{ maxHeight: "60vh", overflowY: "auto", mb: 2 }}>
            <StyledReactMarkdown>{recipe}</StyledReactMarkdown>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              onClick={copyRecipe}
              variant="outlined"
              startIcon={<ContentCopyIcon />}
            >
              Copy Recipe
            </Button>
            <Button
              onClick={() => setRecipeModalOpen(false)}
              variant="contained"
            >
              Close
            </Button>
          </Box>
        </ModalContent>
      </StyledModal>
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseCopySnackbar}
        message="Recipe copied to clipboard!"
      />
    </Box>
  );
}
