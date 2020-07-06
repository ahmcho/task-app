const app = require('./app');
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`TaskApp server is listening on ${port}`)
});