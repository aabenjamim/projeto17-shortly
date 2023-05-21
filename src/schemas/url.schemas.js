import joi from 'joi'

export const urlShortSchema = joi.object({
    url: joi.string().required()
})