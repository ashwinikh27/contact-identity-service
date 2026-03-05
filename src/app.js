const express = require("express");
const cors = require("cors");

const identifyRoutes = require("./routes/identifyRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", identifyRoutes);

app.get("/", (req, res) => {
  res.send("Identity Reconciliation API Running");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});