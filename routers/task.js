const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const Task = require("../models/Task");

//@route POST create-task
//@desc create task and get task
//@access Public
router.post(
  "/create-task",
  [auth, [check("name", "title is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = await Task.find({ user: req.user.id });
      if (task.length === 0) {
        let newTask = new Task({
          user: req.user.id,
          tasks: [
            {
              name: req.body.name,
            },
          ],
        });
        await newTask.save();
        res.json({
          task: { id: newCreatedTask._id, name: req.body.name },
        });
      } else {
        await Task.updateOne(
          { user: req.user.id },
          { $push: { tasks: { name: req.body.name } } }
        );
        res.json({
          task: { id: newCreatedTask._id, name: req.body.name },
        });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("unable to add task");
    }
  }
);

//@route POST list-tasks
//@desc get all tasks
//@access Public
router.get("/list-tasks", auth, async (req, res) => {
  try {
    const task = await Task.find({ user: req.user.id });
    res.json({
      tasks: task[0].tasks,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("unable to get tasks");
  }
});

module.exports = router;
