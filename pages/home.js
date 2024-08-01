"use client";
import { useEffect, useState } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { firestore, getCurrentUser } from "../firebase";
import {
  collection,
  getDocs,
  query,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { signOutUser } from "../firebase";
import { useRouter } from "next/router";
import IngredientCard from "../components/IngredientCard";
import ReactMarkdown from "react-markdown";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
  boxShadow: "none",
  borderRadius: 0,
  "& .MuiPaper-rounded": {
    borderRadius: 0,
  },
}));

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

const StyledReactMarkdown = styled(ReactMarkdown)(({ theme }) => ({
  "& h1, & h2, & h3, & h4, & h5, & h6": {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  "& ul, & ol": {
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  "& li": {
    marginBottom: theme.spacing(1),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
  },
}));

export default function Home({ setUser }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOutUser();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Handle logout error
    }
  };

  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [recipeInputModalOpen, setRecipeInputModalOpen] = useState(false);
  const [additionalInput, setAdditionalInput] = useState("");
  const [recipe, setRecipe] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const updatePantry = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const q = query(collection(firestore, `users/${user.uid}/pantry`));
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

    const user = await getCurrentUser();
    if (!user) return;

    const docRef = doc(
      collection(firestore, `users/${user.uid}/pantry`),
      newItemName.toLowerCase()
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count, imageUrl } = docSnap.data();
      await setDoc(docRef, { count: count + newItemQuantity, imageUrl });
    } else {
      const imageUrl = await fetchIngredientImage(newItemName.toLowerCase());
      await setDoc(docRef, { count: newItemQuantity, imageUrl });
    }
    await updatePantry();
    setNewItemName("");
    setNewItemQuantity(1);
  };

  const removeItem = async (item) => {
    const user = await getCurrentUser();
    if (!user) return;
    const docRef = doc(collection(firestore, `users/${user.uid}/pantry`), item);
    await deleteDoc(docRef);
    await updatePantry();
  };

  const generateRecipe = async () => {
    setIsLoading(true);
    const ingredients = pantry.map(({ name, quantity }) => ({
      name,
      quantity,
    }));
    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients, additionalInput }),
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

  const handleSaveEdit = async (originalName, newName, newCount) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;
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
      const docRef = doc(
        collection(firestore, `users/${user.uid}/pantry`),
        newName.toLowerCase()
      );
      const imageUrl = await fetchIngredientImage(newName.toLowerCase());
      await setDoc(docRef, { count: newCount, imageUrl });
      await updatePantry();
      setEditItem(null);
    } catch (error) {
      console.error("Error saving edit:", error);
    }
  };

  useEffect(() => {
    updatePantry();
  }, []);

  return (
    <Box
      sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}
    >
      {/* AppBar */}
      <StyledAppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            RecipeCrafter
          </Typography>
          <StyledButton
            color="inherit"
            onClick={() => setRecipeInputModalOpen(true)}
            startIcon={<ReceiptLongIcon />}
            disabled={isLoading || pantry.length === 0}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Generate Recipe"
            )}
          </StyledButton>
          <StyledButton
            color="inherit"
            onClick={() => setOpen(true)}
            startIcon={<AddIcon />}
          >
            Add Item
          </StyledButton>
          <StyledButton
            color="inherit"
            onClick={handleLogout}
            startIcon={<ExitToAppIcon />}
          >
            Logout
          </StyledButton>
        </Toolbar>
      </StyledAppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          color="primary"
          fontWeight="bold"
        >
          My Pantry
        </Typography>
        {pantry.length === 0 && (
          <Typography variant="body1" color="textSecondary">
            Your pantry is empty. Click the "Add Item" button to get started!
          </Typography>
        )}
        <Grid container spacing={3}>
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

      {/* Add Item Modal */}
      <StyledModal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="add-item-modal"
      >
        <ModalContent>
          <Typography variant="h6" component="h2" gutterBottom color="primary">
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
            <Button onClick={() => setOpen(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button onClick={addItem} variant="contained" color="primary">
              Add
            </Button>
          </Box>
        </ModalContent>
      </StyledModal>

      {/* Recipe Input Modal */}
      <StyledModal
        open={recipeInputModalOpen}
        onClose={() => setRecipeInputModalOpen(false)}
        aria-labelledby="recipe-input-modal"
      >
        <ModalContent>
          <Typography variant="h6" component="h2" gutterBottom color="primary">
            Recipe Options
          </Typography>
          <Typography variant="body1" paragraph italic color="secondary">
            Input any additional information, such as dietary restrictions or
            preferences, to help generate a recipe that aligns with your tastes.
          </Typography>

          <Box sx={{ maxHeight: "60vh", overflowY: "auto", mb: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Additional Input"
              type="text"
              fullWidth
              variant="outlined"
              value={additionalInput}
              onChange={(e) => setAdditionalInput(e.target.value)}
            />{" "}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              onClick={() => {
                generateRecipe();
                setRecipeInputModalOpen(false);
              }}
              variant="contained"
              color="primary"
            >
              Generate Recipe
            </Button>
            <Button
              onClick={() => setRecipeInputModalOpen(false)}
              variant="outlined"
              color="primary"
            >
              Close
            </Button>
          </Box>
        </ModalContent>
      </StyledModal>

      {/* Recipe Output Modal */}
      <StyledModal
        open={recipeModalOpen}
        onClose={() => setRecipeModalOpen(false)}
        aria-labelledby="recipe-modal"
      >
        <ModalContent>
          <Typography variant="h6" component="h2" gutterBottom color="primary">
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
              color="secondary"
            >
              Copy Recipe
            </Button>
            <Button
              onClick={() => setRecipeModalOpen(false)}
              variant="contained"
              color="primary"
            >
              Close
            </Button>
          </Box>
        </ModalContent>
      </StyledModal>

      {/* Copy Recipe Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseCopySnackbar}
        message="Recipe copied to clipboard!"
      />
    </Box>
  );
}
