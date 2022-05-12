const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    documents: {
        type: Array,
        default: []   
    },
    convertedFiles: {
        type: Array,
        default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

