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
        INSERT INTO "shortenedUrls" ("shortUrl", "originalUrlId", ""visitCount"", "userId")
            VALUES ($1, $2, $3, $4)
        `, [shortUrl, idOriginal.rows[0].id, 0, sessao.rows[0].idUser])

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
        UPDATE "shortenedUrls" SET ""visitCount""="visitCount"+1 WHERE "shortUrl"=$1
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

export async function deleteUrl(req, res){
    const {id} = req.params
    const sessao = res.locals.sessao

    try{
        const urlExiste = await db.query(`
        SELECT * FROM "shortenedUrls" WHERE id = $1
        `, [id])
        if(urlExiste.rows.length===0){
            return res.status(404).send("A url não existe")
        }

        const pertenceUser = await db.query(`
        SELECT * FROM "shortenedUrls" WHERE id = $1 AND "userId"=$2
        `, [id, sessao.rows[0].idUser])
    
        if(pertenceUser.rows.length===0){
            return res.status(401).send("A url não pertence ao usuário")
        }

        await db.query(`DELETE FROM "shortenedUrls" WHERE id = $1;`, [id])

        res.status(204).send("Url deletada com sucesso!")
    } catch(err){
        res.status(500).send(err.message)
    }
}

export async function getUserMe(req, res) {
    const sessao = res.locals.sessao
  
    try {
      const objeto = await db.query(`
        SELECT users.id, users.name, SUM("shortenedUrls"."visitCount") AS "visitCount",
        json_agg(json_build_object(
            'id', "shortenedUrls".id,
            'shortUrl', "shortenedUrls"."shortUrl",
            'url', "originalUrls".url,
            'visitCount', "shortenedUrls"."visitCount"
        )) AS "shortenedUrls"
        FROM users
        LEFT JOIN
          "shortenedUrls" ON "shortenedUrls"."userId" = users.id
        LEFT JOIN
          "originalUrls" ON "originalUrls".id = "shortenedUrls"."originalUrlId"
        WHERE users.id = $1
        GROUP BY users.id;
      `, [sessao.rows[0].idUser])
  
      res.status(200).send(objeto.rows[0])
    } catch(err) {
      res.status(500).send(err.message);
    }
}

export async function getRanking(req, res){
    try{
        const ranking = await db.query(`
        SELECT json_agg(
          json_build_object(
            'id', users.id,
            'name', users.name,
            'linksCount', links.count,
            'visitCount', links.sum_visit_count
          )
        ) AS ranking
        FROM users
        LEFT JOIN (
            SELECT
            "shortenedUrls"."userId",
            COUNT("shortenedUrls".id) AS count,
            COALESCE(SUM("shortenedUrls"."visitCount"), 0) AS sum_visit_count
            FROM "shortenedUrls"
            GROUP BY "shortenedUrls"."userId"
        ) AS links ON links."userId" = users.id
        GROUP BY users.id, links.sum_visit_count
        ORDER BY links.sum_visit_count DESC
        LIMIT 10;
        `)

        res.status(200).send(ranking.rows[0].ranking)
    } catch(err){
        res.status(500).send(err.message);
    }
}