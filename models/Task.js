const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  tasks: [
    {
      name: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = Task = mongoose.model("task", taskSchema);
