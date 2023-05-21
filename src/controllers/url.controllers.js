import { db } from "../database/database.connection.js";
import { nanoid } from "nanoid";

export async function postUrl(req, res){
    const { url } = req.body
    const sessao = res.locals.sessao

    try{
        await db.query(`
        INSERT INTO "originalUrls" (url, "userId")
            VALUES ($1, $2)
        `, [url, sessao.rows[0].idUser])

        const idOriginal = await db.query(`
        SELECT id FROM "originalUrls" WHERE url=$1 AND "userId"=$2
        `, [url, sessao.rows[0].idUser])

        const shortUrl = nanoid(8)

        await db.query(`
        INSERT INTO "shortenedUrls" ("shortUrl", "originalUrlId", "visitCount")
            VALUES ($1, $2, $3)
        `, [shortUrl, idOriginal.rows[0].id, 0])

        const idShortened = await db.query(`
        SELECT id FROM "shortenedUrls" WHERE "shortUrl"=$1
        `, [shortUrl])

        res.status(201).send({id: idShortened.rows[0].id, shortUrl: shortUrl})

    } catch(err){
        res.status(500).send(err.message)
    }
}

export async function getUrlId(req, res){
    const { id } = req.params

    try{
        const existe = await db.query(`
        SELECT * FROM "shortenedUrls" WHERE id=$1
        `, [id])

        if(existe.rows.length===0){
            return res.status(404).send('Url não encontrada')
        }

        const url = await db.query(`
        SELECT "shortenedUrls".id, "shortUrl", "originalUrls".url AS "originalUrl"
        FROM "shortenedUrls"
        JOIN "originalUrls" ON "shortenedUrls"."originalUrlId" = "originalUrls".id
        WHERE "shortenedUrls".id = $1
        `, [id])
        
        res.status(200).send(url.rows[0])
    } catch(err){
        res.status(500).send(err.message)
    }
}

export async function getRedirect(req, res){
    const { shortUrl } = req.params

    try{
        const existe = await db.query(`
        SELECT * FROM "shortenedUrls" WHERE "shortUrl"=$1
        `, [shortUrl])

        if(existe.rows.length===0){
            return res.status(404).send('Url não encontrada')
        }

        await db.query(`
        UPDATE "shortenedUrls" SET "visitCount"="visitCount"+1 WHERE "shortUrl"=$1
        `,[shortUrl])

        const urlOriginal = await db.query(`
        SELECT "originalUrls".url AS "originalUrl"
        FROM "shortenedUrls"
        JOIN "originalUrls" ON "shortenedUrls"."originalUrlId" = "originalUrls".id
        WHERE "shortenedUrls"."shortUrl" = $1
        `, [shortUrl])

        res.redirect(urlOriginal.rows[0].originalUrl)

    } catch(err){
        res.status(500).send(err.message)
    }
}