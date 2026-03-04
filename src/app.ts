import express from "express";
import inventoryRouter from "./routes/inventory.router.js";

const app = express();
const PORT = 8000;

app.use(express.json());

app.use("/api/inventory", inventoryRouter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
