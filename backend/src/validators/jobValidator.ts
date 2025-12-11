import Joi from "joi"

export const validateJobCreation = (data: any) => {
  const schema = Joi.object({
    taskName: Joi.string().min(3).max(255).required(),
    payload: Joi.alternatives().try(Joi.object(), Joi.string()),
    priority: Joi.string().valid("Low", "Medium", "High"),
  })

  return schema.validate(data, { abortEarly: false })
}
