const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { schemaOptions } = require("./modelOptions");
const boardSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  icon: {
    type: String,
    default: "🫡",
  },
  title: {
    type: String,
    default: "Untitled",
  },
  description: {
    type: String,
    default: `Click here to edit the description,
            Let's Go!!!! 🙌 ☆*: .｡. o(≧▽≦)o .｡.:*☆ 🙌
            `,
  },

  position: {
    type: Number,
  },
  favourite: {
    type: Boolean,
    default: false,
  },
  favouritePosition: {
    type: Number,
    default: 0,
  },
}, schemaOptions);
module.exports = mongoose.model('Board', boardSchema);

