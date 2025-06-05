const express = require('express');
const bodyParser = require('body-parser');
const { setRoutes } = require('../routes');
const { errorMiddleware } = require('../middleware/error.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger/swagger.config');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(authMiddleware);
setRoutes(app);
app.use(errorMiddleware);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});