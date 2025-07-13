import app from "./app";
import { config } from "./config/env";

app.listen(config.port, () => {
  console.log(`Servidor corriendo en http://localhost:${config.port}`);
});
