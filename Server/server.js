const express = require(`express`);
const bodyParser = require(`body-parser`);
const fileUpload = require(`express-fileupload`);

const adminCtl = require(`./controllers/admin.ctl`);
const searchCtl = require(`./controllers/search.ctl`);
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
app.post(`/search`, searchCtl.search);
app.post(`/deactivateFile`, adminCtl.deactivateFile);
app.post(`/activateFile`, adminCtl.activateFile);
app.get(`/getDocumentContent`, searchCtl.getDocument);
app.get(`/getAllDocumentsData`, adminCtl.getAllDocumentsMetaData);
app.listen(port, () => console.log(`listening on port ${port}`));
