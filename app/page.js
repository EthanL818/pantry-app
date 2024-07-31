"use client";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { firestore } from "./firebase";
import {
  collection,
  getDocs,
  query,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export default function Home() {
  // State to manage pantry items
  const [pantry, setPantry] = useState([]);

  // Modal states and functions
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [itemName, setItemName] = useState("");

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
    const docRef = await doc(collection(firestore, "pantry"), item);

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else await setDoc(docRef, { count: 1 });
    await updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    await deleteDoc(docRef);
    await updatePantry();
  };

  useEffect(() => {
    updatePantry();
  }, []);

  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={2}
    >
      <Button variant="contained" onClick={handleOpen}>
        Add Item
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width={"100%"} direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box border={"1px solid #333"}>
        <Box
          width={"800px"}
          height={"100px"}
          bgcolor={"#ADD8E6"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography variant="h3" color="#333" textAlign={"center"}>
            Pantry Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={"auto"}>
          {pantry.map(({ name, count }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              bgcolor="#f0f0f0"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              paddingX={2}
            >
              <Typography variant="h3" color="#333" textAlign={"center"}>
                {
                  // Capitalize the first letter
                  name.charAt(0).toUpperCase() + name.slice(1)
                }
              </Typography>
              <Typography variant="h3" color="#333" textAlign={"center"}>
                Quantity: {count}
              </Typography>
              <Button
                variant="contained"
                onClick={() => removeItem(name)}
                color="error"
              >
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
