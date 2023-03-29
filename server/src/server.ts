import app from "./app";
import env from "./util/validateEnv";
import mongoose from "mongoose";

const start = async () => {
  const port = env.PORT;
  try {
    await mongoose.connect(env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
