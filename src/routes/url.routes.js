import { Router } from "express";
import { deleteUrl, getRanking, getRedirect, getUrlId, getUserMe, postUrl } from "../controllers/url.controllers.js";
import { autenticacao } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validateSchema.middleware.js";
import { urlShortSchema } from "../schemas/url.schemas.js";


const urlRouter = Router()

urlRouter.post('/urls/shorten', autenticacao, validate(urlShortSchema), postUrl)
urlRouter.get('/urls/:id', getUrlId)
urlRouter.get('/urls/open/:shortUrl', getRedirect)
urlRouter.delete('/urls/:id', autenticacao, deleteUrl)
urlRouter.get('/users/me', autenticacao, getUserMe)
urlRouter.get('/ranking', getRanking)

export default urlRouter