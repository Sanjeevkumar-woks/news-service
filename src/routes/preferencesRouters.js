import Router from "express";

import * as preferenceController from "../controllers/preferenceController.js";

const preferencesRoutes = Router();

preferencesRoutes.post("/create", preferenceController.createPreferences);

preferencesRoutes.put(
  "/update/:preferences_id",
  preferenceController.updatePreferences
);

preferencesRoutes.delete("/delete", preferenceController.deletePreferences);

preferencesRoutes.get("/get/:user_id", preferenceController.getPreferences);

export default preferencesRoutes;
