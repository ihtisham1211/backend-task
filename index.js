const express = require("express");
const connectToDb = require("./Database/db");
var cors = require("cors");
const path = require("path");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
connectToDb();

app.use(express.json({ limit: "5mb" }));
app.use(
  express.urlencoded({ limit: "5mb", extended: true, parameterLimit: 50000 })
);

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/", require("./routers/user"));
app.use("/", require("./routers/task"));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
