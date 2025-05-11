import { Router } from "express";
import * as geminiController from "../controllers/gemini.controller.js";
const route = Router();

route.get("/generate", geminiController.generateContentController);

export default route;
