import joi from 'joi'

export const cadastradoSchema = joi.object({
   name: joi.string().required(),
   email: joi.string().email().required(), 
   password: joi.string().required(), 
   confirmPassword : joi.string().valid(joi.ref('password')).required().strict()
})

export const loginSchema = joi.object({
   email: joi.string().email().required(),
   password: joi.string().required()
})