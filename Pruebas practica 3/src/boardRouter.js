import express from 'express';
import * as boardService from './boardService.js';
const router = express.Router();


router.get('/', (_req, res) => {
    const type = _req.query.type;
    let products = {};

    if (!type || type === 'todos') {
        products.sudaderas = productService.getPosts('sudaderas');
        products.camisetas = productService.getPosts('camisetas');
        products.gorros = productService.getPosts('gorros');
    } else {
        products[type] = productService.getPosts(type);
    }

    res.render('index', products);
});

router.post('/post/new', (req, res) => {
    let { nombre, descripcion, precio, elementRadio, imagen } = req.body;
    boardService.addPost(elementRadio, { elementRadio, nombre, descripcion, precio, imagen });
    res.render('saved_post');
});


router.get('/post/:id,:elementRadio', (req, res) => {
    let post = boardService.getPost(req.params.elementRadio, req.params.id);
    res.render('show_post', { post });
});


// Asumiendo que productService.getPosts ahora acepta un segundo argumento que especifica cuántos posts saltar
router.get('/loadMore', (req, res) => {
    const type = req.query.type;
    const skip = Number(req.query.skip) || 0;
    const products = productService.getPosts(type, skip);
    res.json(products);
});

// borrado de elementos
router.get('/post/:id/delete', (req, res) => {
    const elementRadio = req.query.elementRadio;
    const postId = req.params.id;

    if (elementRadio) {
        boardService.deletePost(elementRadio, postId);
        res.render('deleted_post');
    } else {
        console.error('La categoría no se proporcionó en la URL.');
        res.status(400).send('Bad Request');
    }
});



// Ruta adicional que maneja la solicitud GET a '/'
router.get('/', (req, res) => {
    // Renderizar la vista 'Producto' con datos del cuerpo de la solicitud
    res.render('Producto', {
        name: req.body.name,
        rating: req.body.rating,
        review: req.body.review,
    });
});

// Arreglo para almacenar reseñas
let reviews = new Map();

// Ruta para manejar la solicitud POST a '/:review'
router.post('/post/:id,:elementRadio', (req, res) => {
    // Agregar la nueva reseña al arreglo
    if (!req.body.name || !req.body.rating || !req.body.review) {
        // Renderizar la vista 'Producto' con un mensaje de error si faltan campos
        res.render('show_post', { errorMessage: 'Por favor ingrese todos los campos', reviews: reviews });
        return;
    } else {
        reviews.set(req.params.id, {
            name: req.body.name,
            rating: req.body.rating,
            review: req.body.review
        });
    }


    // Renderizar la vista 'Producto' con el arreglo de reseñas actualizado
    res.render('show_post', { reviews: req.params.id });
});

// Exportar el enrutador para su uso en otras partes de la aplicación
export default router;
