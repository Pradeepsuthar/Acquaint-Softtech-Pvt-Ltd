import express from 'express';
import { registerController, loginController, productController } from '../controller';
import isAuthenticated from '../middlewares/auth';
import isAdmin from '../middlewares/admin';

const router = express.Router();

// --------------------- User Controller -------------------------------------- //

router.post('/register', registerController.register);
router.post('/login', loginController.login);
router.post('/logout', isAuthenticated, loginController.logout);

// --------------------- Products Controller --------------------------------- //

router.post('/create-product', [isAuthenticated, isAdmin], productController.createProduct);
router.put('/update-product/:id', [isAuthenticated, isAdmin], productController.updateProduct);
router.delete('/delete-product', [isAuthenticated, isAdmin], productController.deleteProduct);
router.post('/get-product-by-id', productController.getProductById);
router.get('/get-all-products', productController.getAllProducts);
router.post('/save-product-image', [isAuthenticated, isAdmin], productController.addProductimage);
router.delete('/delete-product-image', [isAuthenticated, isAdmin], productController.deleteProductImage);
router.get('/get-product-images-by-product-id/:id', productController.getProductImagesByProductId);

export default router;
