import express from "express";
import 'dotenv/config';
import { initDB } from "./configs/sequelize.config.js";
import mainRoute from "./routes/main.route.js";
import setupAssociations from "./database/models/model.associations.js";

const app = express();
app.use(express.json());
// Routers
app.use('/api', mainRoute);

const PORT = process.env.APP_PORT || 3000;

setupAssociations();
(async ()=> await initDB())();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});