import { db } from "../database/database.connection.js"

export async function autenticacao (req, res, next){
    const { authorization } = req.headers

    const token = authorization?.replace("Bearer ", "")

    if (!token) return res.status(401).send("Token inexistente")

    try{
        const sessao = await db.query(`SELECT * FROM sessions WHERE token=$1`,
        [token])
        if(sessao.rowCount===0){
            return res.status(401).send("Token inválido")
        }
        
        res.locals.sessao = sessao

        next()
    } catch (err){
        res.status(500).send(err.message)
    }
}