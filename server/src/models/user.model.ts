import { InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    select: false,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type User = InferSchemaType<typeof userSchema>;

export default model("User", userSchema);
