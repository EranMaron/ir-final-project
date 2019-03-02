const express = require(`express`);
const bodyParser = require(`body-parser`);
const fileUpload = require(`express-fileupload`);

const adminCtl = require(`./controllers/admin.ctl`);
const errObj = require(`./errObj`);

const app = express();
const port = process.env.PORT || 3000;
app.set(`port`, port);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use((req, res, next) => {
  res.header(`Access-Control-Allow-Origin`, `*`);
  res.header(
    `Access-Control-Allow-Headers`,
    `Origin,X-Requested-With, Content-Type, Accept`
  );
  res.set(`Content-Type`, `application/json`);
  next();
});

app.post(`/upload`, adminCtl.uploadFile);

app.listen(port, () => console.log(`listening on port ${port}`));
