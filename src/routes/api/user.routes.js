import { Router } from "express";
import UserManager from "../../managers/user.manager.js";

import {
  ERROR_INVALID_ID,
  ERROR_NOT_FOUND_ID,
  ERROR_NOT_FOUND_CREDENTIALS,
} from "../../constants/messages.constant.js";

const router = Router();
const userManager = new UserManager();

// Función para manejar errores
const errorHandler = (res, message) => {
  if (message === ERROR_INVALID_ID)
    return res.status(400).json({ status: false, message: ERROR_INVALID_ID });
  if (message === ERROR_NOT_FOUND_ID)
    return res.status(404).json({ status: false, message: ERROR_NOT_FOUND_ID });
  if (message === ERROR_NOT_FOUND_CREDENTIALS)
    return res
      .status(401)
      .json({ status: false, message: ERROR_NOT_FOUND_CREDENTIALS });
  return res.status(500).json({ status: false, message });
};

// Middleware para validar la sesión del usuario
const validateSession = (req, res, next) => {
  if (!req.session?.user?.loggedIn) {
    return res
      .status(403)
      .send("Este es un recurso privado exclusivo para usuarios registrados");
  }

  // Si está autenticado, continúa al siguiente middleware o ruta
  next();
};

// Ruta para obtener todos los usuarios
router.get("/", validateSession, async (req, res) => {
  try {
    const usersFound = await userManager.getAll(req.query);
    res.status(200).json({ status: true, payload: usersFound });
  } catch (error) {
    errorHandler(res, error.message);
  }
});

// Ruta para obtener un usuario por su ID
router.get("/:id", validateSession, async (req, res) => {
  try {
    const userFound = await userManager.getOneById(req.params.id);
    res.status(200).json({ status: true, payload: userFound });
  } catch (error) {
    errorHandler(res, error.message);
  }
});

// Ruta para crear un nuevo usuario
router.post("/", async (req, res) => {
  try {
    const userCreated = await userManager.insertOne(req.body);
    res.status(201).json({ status: true, payload: userCreated });
  } catch (error) {
    errorHandler(res, error.message);
  }
});

// Ruta para actualizar un usuario existente
router.put("/:id", validateSession, async (req, res) => {
  try {
    const userUpdated = await userManager.updateOneById(
      req.params.id,
      req.body
    );
    res.status(200).json({ status: true, payload: userUpdated });
  } catch (error) {
    errorHandler(res, error.message);
  }
});

// Ruta para eliminar un usuario por su ID
router.delete("/:id", validateSession, async (req, res) => {
  try {
    const userDeleted = await userManager.deleteOneById(req.params.id);
    res.status(200).json({ status: true, payload: userDeleted });
  } catch (error) {
    errorHandler(res, error.message);
  }
});

export default router;
