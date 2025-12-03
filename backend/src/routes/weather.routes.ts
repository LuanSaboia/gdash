import { Router } from "express";
import Weather from "../models/Weather";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    const doc = await Weather.create(data);

    return res.status(201).json({ message: "Weather saved", id: doc._id });
  } catch (error) {
    console.error("ERRO ao salvar clima:", error);
    return res.status(500).json({ error: "Erro ao salvar clima" });
  }
});

export default router;
