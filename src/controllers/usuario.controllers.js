import { db } from "../database/database.connection.js"
import bcrypt from 'bcrypt'
import {v4 as uuid} from 'uuid'

export async function postCadastro(req, res){
   const { name, email, password, confirmPassword } = req.body

   try{
    const emailExiste = await db.query(`SELECT email FROM users WHERE email=$1`, [email])
    if(emailExiste.rows.length!==0){
        return res.status(409).send("Email já possui cadastro")
    }

    const senhaCripto = bcrypt.hashSync(password, 10)

    await db.query(`
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    `, [name, email, senhaCripto])

    res.status(201).send("Usuário cadastrado!")
   } catch(err){
    res.status(500).send(err.message)
   }
}

export async function postLogin(req, res){
    const { email, password } = req.body

    try{
        const user = await db.query(`
        SELECT * FROM users WHERE email=$1
        `, [email])
        
        if(user.rowCount===0){
            return res.status(401).send("Email não cadastrado!")
        } 

        const senhaCorreta = bcrypt.compareSync(password, user.rows[0].password)
            if(!senhaCorreta) return res.status(401).send("Senha incorreta!")

        const token = uuid()
        const idUser = user.rows[0].id
        await db.query(`
        INSERT INTO sessions (token, "idUser")
            VALUES ($1, $2)
        `, [token, idUser])

        res.status(200).send({token:token, idUser: idUser, name: user.rows[0].name })

    }catch(err){
        res.status(500).send(err.message)
    }    
}