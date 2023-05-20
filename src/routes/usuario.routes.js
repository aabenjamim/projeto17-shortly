import { Router } from "express";
import { postCadastro } from "../controllers/usuario.controllers.js";
import { validate } from "../middlewares/validateSchema.middleware.js";
import { cadastradoSchema } from "../schemas/usuario.schema.js";

const usuarioRouter = Router()

usuarioRouter.post('/signup', validate(cadastradoSchema), postCadastro)

export default usuarioRouter