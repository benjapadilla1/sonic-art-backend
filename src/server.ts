import dotenv from "dotenv";
dotenv.config();

import app from "./app";

app.listen(process.env.PORT || 3001, () => {
  console.log(
    `Servidor corriendo en http://localhost:${process.env.PORT || 3001}`
  );
});
