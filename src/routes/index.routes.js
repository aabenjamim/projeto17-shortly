import { Router } from "express"
import usuarioRouter from "./usuario.routes.js"
import urlRouter from "./url.routes.js"

const router = Router()

router.use(usuarioRouter)
router.use(urlRouter)

export default router