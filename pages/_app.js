import { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "../styles/theme";
import { getCurrentUser } from "../firebase";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("Checking user...");
        const currentUser = await getCurrentUser();
        console.log("Current user:", currentUser);
        setUser(currentUser);
        if (currentUser && router.pathname === "/") {
          router.push("/home");
        } else if (!currentUser && router.pathname !== "/") {
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} user={user} setUser={setUser} />
    </ThemeProvider>
  );
}

export default MyApp;
