import Joi from 'joi';

const productSchema = Joi.object({    
    name: Joi.string().required(),
    category: Joi.string().required(),
    ownerID: Joi.string().required(),
    price: Joi.number().required(),
    manufactureDate: Joi.string().required(),
    expiryDate: Joi.string().required(),
    status: Joi.string().required(),
    productCode: Joi.string().required(),
    isAvailable:Joi.boolean().required(),
    thumbnail: Joi.string(),
});

export default productSchema;