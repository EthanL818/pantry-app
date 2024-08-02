import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Box,
} from "@mui/material";
import { Kitchen, RestaurantMenu, EmojiPeople } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import { signInWithGoogle } from "../firebase";
import { useRouter } from "next/router";

export default function LandingPage({ setUser }) {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      setUser(user);
      router.push("/home");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <>
      <AppBar position="static" color="primary" sx={{ borderRadius: 0 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RecipeCrafter
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogin}
            startIcon={<GoogleIcon />}
          >
            Sign in with Google
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              Turn Your Pantry into Healthy, Delicious Meals
            </Typography>
            <Typography variant="h5" paragraph sx={{ color: "text.secondary" }}>
              The smart way to cook with what you have.
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={handleLogin}
              startIcon={<GoogleIcon />}
            >
              Get Started with Google
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Recipe illustration"
                style={{ width: "100%", height: "auto", borderRadius: 8 }}
              />
            </Paper>
          </Grid>
        </Grid>
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center">
            How It Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Kitchen sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  1. Input Your Ingredients
                </Typography>
                <Typography align="center">
                  {"Tell us what's in your pantry and fridge."}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <RestaurantMenu
                  sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  2. Get Recipes
                </Typography>
                <Typography align="center">
                  {"We'll suggest easy, student-friendly recipes."}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <EmojiPeople
                  sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                  3. Start Cooking
                </Typography>
                <Typography align="center">
                  Follow our simple instructions and enjoy your meal!
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
