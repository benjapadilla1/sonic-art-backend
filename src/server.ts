import dotenv from "dotenv";
import app from "./app";

dotenv.config();

app.listen(process.env.PORT || 3001, () => {
  console.log(
    `Servidor corriendo en http://localhost:${process.env.PORT || 3001}`
  );
});
