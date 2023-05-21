import { Router } from "express";
import { getUrlId, postUrl } from "../controllers/url.controllers.js";
import { autenticacao } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validateSchema.middleware.js";
import { urlShortSchema } from "../schemas/url.schemas.js";


const urlRouter = Router()

urlRouter.post('/urls/shorten', autenticacao, validate(urlShortSchema), postUrl)
urlRouter.get('/urls/:id', getUrlId)

export default urlRouter