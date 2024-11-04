import Router from "express";

import * as preferenceController from "../controllers/preferenceController.js";

const preferencesRoutes = Router();

//create preferences
preferencesRoutes.post("/create", preferenceController.createPreferences);

//get preferences
preferencesRoutes.get("/get/:user_id", preferenceController.getPreferences);

//update preferences
preferencesRoutes.put(
  "/update/:preferences_id",
  preferenceController.updatePreferences
);

//delete preferences
preferencesRoutes.delete(
  "/delete/:user_id",
  preferenceController.deletePreferences
);

export default preferencesRoutes;
