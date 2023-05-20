import { Router } from "express";
import { postCadastro, postLogin } from "../controllers/usuario.controllers.js";
import { validate } from "../middlewares/validateSchema.middleware.js";
import { cadastradoSchema, loginSchema } from "../schemas/usuario.schema.js";

const usuarioRouter = Router()

usuarioRouter.post('/signup', validate(cadastradoSchema), postCadastro)
usuarioRouter.post('/signin', validate(loginSchema), postLogin)

export default usuarioRouter