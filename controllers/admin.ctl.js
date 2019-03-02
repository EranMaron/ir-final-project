const bodyParser  = require(`body-parser`),
      fileUpload  = require(`express-fileupload`),
      fs          = require(`fs`),
      unzip       = require(`unzip`)
      path        = require(`path`),
      rimraf      = require(`rimraf`),
      errObj      = require(`../errObj`),
      util        = require(`util`);    // for objects content in console   ---> *** DELETE AT THE END ***



const zipFileName = `zipFile.zip`;
const MACOSX = `__MACOSX`;
const DS_Store = `.DS_Store`;
const sourceDir   = path.join(__dirname, '../documents/source');          

if (!fs.existsSync(sourceDir)) {  // return true if path exists. false otherwise
  fs.mkdirSync(sourceDir);
}







/* generates a serial number depending on the files in stoage */
getSerialNumber = () => {
  let filesInDir = fs.readdirSync(`${__dirname}/../documents/storage`, (err, files) => {
    if (err) res.send(new errObj(404, err));
  });

  filesInDir = filesInDir.filter(file => {  // in order to ignore the '.DS_Store' file
    return file != `.DS_Store`;
  });

  for (let i = 0; i < filesInDir.length; i++)
    filesInDir[i] = filesInDir[i].slice(0, -4);

  return filesInDir.length === 0 ? 0 : Math.max(...filesInDir);
};

tokenize = fileContent => {
  splitMulti = (str, tokens) => {
    var tempChar = tokens[0];
    for (var i = 1; i < tokens.length; i++) {
      str = str.split(tokens[i]).join(tempChar);
    }
    str = str.split(tempChar);
    return str;   // array of all the words after cleaning
  };

  fileContent = fileContent.toLowerCase();
  fileContent = splitMulti(fileContent, [`:`, `;`, ` `, `\n`, `"`, `,`, `.`]);
  fileContent = fileContent.filter(word => {
    return word.length != 0;
  });
  return fileContent;
};








module.exports = {

  async uploadFile(req, res, next) {
    console.log(">> in uploadFile()")
    const file = req.files.file;
    let uploadedFolder;
    var filesInDir;
    
    if (file.mimetype !== `application/zip`) {    // in this case- the file is not a zip file..
      // NOT ZIP DO SOMETHING.. ZIP VALIDATION
    }

    file.mv(`${sourceDir}/${zipFileName}`);   // moving the zip file to the zipUploade folder
    res.json(`succeess`);

    /* unzip the zip file */
    fs.createReadStream(`${sourceDir}/${zipFileName}`).pipe(unzip.Extract({ path: `${sourceDir}`})).on('close', () => {
        filesInDir = fs.readdirSync(`${sourceDir}`, (err, files) => {
        if (err) res.send(new errObj(404, err));
      });
    })
    fs.unlinkSync(`${sourceDir}/${zipFileName}`); // deleting the zip file after unzipping it    

    console.log(filesInDir);

    /* give the txt files names + locating the txt file in 'source' */
    let serialNumber =  getSerialNumber();
    

    // for (let i = 0 ; i < filesInDir.length ; i++){
    //   if (filesInDir[i] != MACOSX && filesInDir[i] != DS_Store) {
    //     console.log(filesInDir[i])
    //     uploadedFolder = filesInDir[i];   // for holding the uploaded folder name
    //   }
        
    // }
    // let uploadedTxtFiles = fs.readdirSync(`${sourceDir}/${uploadedFolder}`, (err, files) => { // for holding the uploaded files names
    //   if (err) res.send(new errObj(404, err));
    // });
    //   uploadedTxtFiles.map(txtFile => {
    //     fs.renameSync(`${sourceDir}/${uploadedFolder}/${txtFile}` , `${sourceDir}/${++serialNumber}.txt`);   // moving the file to the Storage folder + changing the files name
    // })

    /*Erasing the prev extracted folder*/
    // rimraf.sync(`${sourceDir}/${uploadedFolder}` , () => {console.log("bla")});
    // rimraf.sync(`${sourceDir}/${MACOSX}` , () => {console.log("bla")});

    // uploade Zip



    // let fileContent = file.documents.toString(`utf8`);

    // //Indexing
    // let tokenized = tokenize(fileContent);

    //Saving the file to Storage folder
    // let serialNumber = getSerialNumber();
    // file.mv(`${__dirname}/../documents/zipUpload/${++serialNumber}.zip`);   // moving the file to the Storage folder
    // res.json(`succeess`);
  }
}



/*
filesInDir = filesInDir.filter(file => {
      return file != `.DS_Store`;
    });
*/