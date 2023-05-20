import { db } from "../database/database.connection.js"
import bcrypt from 'bcrypt'
import {v4 as uuid} from 'uuid'

export async function postCadastro(req, res){
   const { name, email, password, confirmPassword } = req.body

   try{

    const emailExiste = await db.query(`SELECT email FROM users`)
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
    
}