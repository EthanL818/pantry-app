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
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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
  justifyContent: "space-between",
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

  const updatePantry = async () => {
    const q = query(collection(firestore, "pantry"));
    const querySnapshot = await getDocs(q);
    const pantryList = [];

    querySnapshot.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    });

    setPantry(pantryList);
  };

  const addItem = async (item) => {
    if (!item.trim()) return;
    const docRef = doc(collection(firestore, "pantry"), item.toLowerCase());

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
      // Fetch image for new ingredient
      await fetchIngredientImage(item.toLowerCase());
    }
    await updatePantry();
    setItemName("");
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
        setIngredientImage((prevState) => ({
          ...prevState,
          [ingredient]: data.imageUrl,
        }));
        console.log(data.imageUrl);
      }
    } catch (error) {
      console.error("Error fetching ingredient image:", error);
    }
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
          {pantry.map(({ name, count }) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={name}>
              <StyledCard>
                {ingredientImage[name] && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={ingredientImage[name]}
                    alt={name}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" component="div">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {count}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => removeItem(name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Container>
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
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => addItem(itemName)}
              variant="contained"
              sx={{ ml: 1 }}
            >
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
