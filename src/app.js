const express = require("express");
const cors = require("cors");
const path = require("path");

const identifyRoutes = require("./routes/identifyRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/", identifyRoutes);

app.get("/", (req, res) => {
  res.send("Identity Reconciliation API Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});