import { Router } from "express";
import { login } from "../../src/controller/authController";

const router = Router();

router.post("/login", login);

export default router;
