const bodyParser = require(`body-parser`),
  fileUpload = require(`express-fileupload`),
  fs = require(`fs`),
  unzip = require(`unzip`);
(path = require(`path`)),
  (rimraf = require(`rimraf`)),
  (errObj = require(`../errObj`)),
  (util = require(`util`)); // for objects content in console   ---> *** DELETE AT THE END ***

const MACOSX = `__MACOSX`;
const DS_Store = `.DS_Store`;
const sourceDir = path.join(__dirname, "../documents/source");
const storageDir = path.join(__dirname, "../documents/storage");

if (!fs.existsSync(sourceDir)) {
  // return true if path exists. false otherwise
  fs.mkdirSync(sourceDir);
}


/* generates a serial number depending on the files in stoage */
getSerialNumber = () => {
  let filesInDir = fs.readdirSync(
    `${__dirname}/../documents/storage`,
    (err, files) => {
      if (err) res.send(new errObj(404, err));
    }
  );

  filesInDir = filesInDir.filter(file => { 
    return file != `.DS_Store`;   // in order to ignore the '.DS_Store' file 
  });

  for (let i = 0; i < filesInDir.length; i++)
    filesInDir[i] = filesInDir[i].slice(0, -4);

  return filesInDir.length === 0 ? 0 : Math.max(...filesInDir);
};


/* function for holding all the terms in the txt document, in 1 array */
tokenize = fileContent => {
  splitMulti = (str, tokens) => {
    var tempChar = tokens[0];
    for (var i = 1; i < tokens.length; i++) {
      str = str.split(tokens[i]).join(tempChar);
    }
    str = str.split(tempChar);
    return str; // array of all the words after cleaning
  };

  fileContent = fileContent.toLowerCase();
  fileContent = splitMulti(fileContent, [`:`, `;`, ` `, `\n`, `"`, `,`, `.`]);
  fileContent = fileContent.filter(word => {
    return word.length != 0;
  });
  return fileContent;
};




function createInitializedTermsArray (fileName) {
  // clean words from the txt file + add each word a doc #      ---> we have an array that holds: {word , doc #}. duplicated words allowed at this step
    let fileContent = fs.readFileSync(`${sourceDir}/${fileName}`)
    let tokenizedFileContent = tokenize(fileContent.toString('utf8'));
    let objectsArray = new Array();

    tokenizedFileContent.map(term => {  // basic initializaition of the objects array. duplicate values is allowed.
      let tmpTerm = {
        term: term,
        locations: [{
          documentNumber: fileName.slice(0,-4),
          hits: 1
        }]
      }
      objectsArray.push(tmpTerm);
    });

    return objectsArray;
}


function compareTermsForSortingFunc (a,b) {
  if (a.term < b.term)
    return -1;
  if (a.term > b.term)
    return 1;
  return 0;
}

/* this function will create a sorted Array, that holds all the words from all the documents- all together as Terms Object */
function createGeneralTermsObjectsArray (filesInSource) {  
  let generalWordsArray = new Array();
  for(let i = 0 ; i < filesInSource.length ; i++) {
    if (i === 0)
      generalWordsArray = createInitializedTermsArray(filesInSource[i]);
    else
      generalWordsArray = generalWordsArray.concat(createInitializedTermsArray(filesInSource[i]));           
  }
  generalWordsArray.sort(compareTermsForSortingFunc);  
  return generalWordsArray;
}


function sortAndMergeTermsFunc (generalTermsArray) {
  let keyIndex = 0; // "ptr" to the term that we are working on. final merged term will be stored in this index.
  let runnerIndex = 1;  // "ptr" for checking the next words
  let mergedArray = new Array();
  let numOfTerms = generalTermsArray.length;
  let firstInitializationFlag = true;
  let tmpTerm = {
    term: '',
    locations: [{
      documentNumber: -1,
      hits: -1
    }]
  }

  while(keyIndex < numOfTerms) {
    if (firstInitializationFlag) {  // initialization needed just when first visiting a new term. Before moving to the next new term, the flag will set to 'true'
      tmpTerm = JSON.parse(JSON.stringify(generalTermsArray[keyIndex])); // a *real* shallow copy
      firstInitializationFlag = false;
    }
      
    if (runnerIndex >= numOfTerms) {  // runner got to the end of the termsArray
        mergedArray.push(JSON.parse(JSON.stringify(tmpTerm)));  // pushing a clone of the tmpTerm to the final merged Array
        keyIndex += runnerIndex - keyIndex;
        firstInitializationFlag = true;
        break;
    }

    if (tmpTerm.term === generalTermsArray[runnerIndex].term ) {
      /* check if they are in the same document */
      for (let i = 0 ; i < tmpTerm.locations.length ; i++) {
        if (tmpTerm.locations[i].documentNumber === generalTermsArray[runnerIndex].locations[0].documentNumber){   // same document
          tmpTerm.locations[i].hits++;
          break;
        }
        else if (tmpTerm.locations[i].documentNumber !== generalTermsArray[runnerIndex].locations[0].documentNumber && i === tmpTerm.locations.length - 1){   // adding the new documentNumber to the tmpTerm locations array
          tmpTerm.locations.push(JSON.parse(JSON.stringify(generalTermsArray[runnerIndex].locations[0])));  // pushing a clone- by value
          break;
        }
      }
      runnerIndex++
    }
    else {  // in this case- tmpTerm is not equals to the up running term in the 'generalTermsArray[runnerIndex]'
      mergedArray.push(JSON.parse(JSON.stringify(tmpTerm)));  // pushing a clone of the tmpTerm to the final merged Array
      keyIndex += runnerIndex - keyIndex; // keyIndex will now point to the next new term.
      runnerIndex = keyIndex + 1;
      firstInitializationFlag = true;
      tmpTerm = {   // empting the tmpTerm. ready for holding the next term.
        term: '',
        locations: [{
          documentNumber: -1,
          hits: -1
        }]
      }
    }
  }
  return mergedArray;
}



/* *** IS IT NEEDED??? FOR OPTIMIZATION*** */

/* bollean function to check if some documentNumber is already exists in a term's locations Array  */
// function checkIfSameDocNumberExists(termObjToCheck , docNumberToCheck) {
//   for (let i = 0 ; i < termObjToCheck.locations.length ; i++) {
//     if (termObjToCheck.locations[i].documentNumber === docNumberToCheck)      
//       return true;   // 'docNumberToCheck' exists in the 'termObjToCheck' locations array
//   }
//   return false; // 'docNumberToCheck' is not exist in the 'termObjToCheck' locations array
// }




























module.exports = {

  // *** breaking optimization needed --> break into small functions ***
  uploadFile(req, res, next) {    
    console.log(">> in uploadFile()");
    const file = req.files.file;
    const zipFileName = req.files.file.name;
    let uploadedFolder;
    let mergedArray = new Array();
    let generalTermsArray = new Array();

    if (file.mimetype !== `application/zip`) {  // in this case- the file is not a zip file..
      // NOT ZIP DO SOMETHING.. ZIP VALIDATION
    }

    file.mv(`${sourceDir}/${zipFileName}`); // moving the zip file to the zipUploade folder
    res.json(`succeess`);

    /* unzip the zip file */
    fs.createReadStream(`${sourceDir}/${zipFileName}`)
      .pipe(unzip.Extract({ path: `${sourceDir}` }))
      .on("close", () => {
        let filesInDir = fs.readdirSync(`${sourceDir}`, (err, files) => {
          if (err) res.send(new errObj(404, err));
        });

        fs.unlinkSync(`${sourceDir}/${zipFileName}`); // deleting the zip file after unzipping it

        for (let i = 0; i < filesInDir.length; i++) {
          if (
            filesInDir[i] != MACOSX &&
            filesInDir[i] != DS_Store &&
            filesInDir[i] != zipFileName
          ) {
            uploadedFolder = filesInDir[i]; // for holding the uploaded folder name
          }
        }

        let uploadedTxtFiles = fs.readdirSync(   // for holding the uploaded files names

          `${sourceDir}/${uploadedFolder}`,
          (err, files) => {
            if (err) res.send(new errObj(404, err));
          }
        );

        /* give the txt files names + locating the txt file in 'source' */
        let serialNumber = getSerialNumber();

        uploadedTxtFiles.map(txtFile => {
          if (txtFile != DS_Store) {
            fs.renameSync(    // moving the file to the Storage folder + changing the files name
              `${sourceDir}/${uploadedFolder}/${txtFile}`,
              `${sourceDir}/${++serialNumber}.txt`
            ); 
          }
        });

        /*Erasing the prev extracted folder*/
        rimraf.sync(`${sourceDir}/${uploadedFolder}`, null, err => {
          res.send(new errObj(404, err));
        });
        rimraf.sync(`${sourceDir}/${MACOSX}`, null, err => {
          res.send(new errObj(404, err));
        });
        

        let filesInSource = fs.readdirSync(`${sourceDir}`, (err, files) => {     // for holding the uploaded files names
          if (err) res.send(new errObj(404, err));
        });
    
        filesInSource = filesInSource.filter(file => {
          return file.match(`[0-9]+.txt`);      //removing redundent files from filesInSource array
        });
        /* *** at this point: files are uploaded. *** */


        createGeneralTermsObjectsArray(filesInSource);  // for holding the words from all the documents- all together as a TermsObjects Array
        mergedArray = sortAndMergeTermsFunc(generalTermsArray); // mergedArray is now an Index JSON object. holds locations, hits, no duplicates terms.


      });
    }
}
























// function sortAndMergeTermsFunc (generalTermsArray) {
  //   let keyIndex = 0; // "ptr" to the term that we are working on. final merged term will be stored in this index.
  //   let runnerIndex = 1;  // "ptr" for checking the next words
  //   let mergedArray = new Array();
  //   let tmpTerm = {
  //     term: '',
  //     locations: [{
  //       documentNumber: -1,
  //       hits: -1
  //     }]
  //   }
  
  //   while(keyIndex != -1) {
  //     if(runnerIndex >= generalTermsArray.length) {    // end of termsArray
  //       if (runnerIndex - keyIndex === 1) 
  //         mergedArray.push((generalTermsArray[keyIndex]).splice(0)) // simply push the last element cause it doesnt have duplicates occurences
  //       else {
  //         let numOfElementsToDelete;
  //         numOfElementsToDelete = runnerIndex-1 - keyIndex;
  //         if (numOfElementsToDelete === 0)
  //           continue;
  //         else {
  //           tmpTerm.push(generalTermsArray[keyIndex].splice(0));
  //           keyIndex = -1;
  //           // generalTermsArray.splice(keyIndex + 1 , numOfElementsToDelete ); // leaving only the updated first term, erasing all duplicated terms.
  //           // console.log("\n\nTMP CHECK");
  //         }  
  //       }
  //     }
  //     if (generalTermsArray[keyIndex].term === generalTermsArray[runnerIndex].term) { // another occurrence of the term 'generalTermsArray[keyIndex]'
  //       if (runnerIndex = keyIndex === 1) 
  //         tmpTerm = generalTermsArray.splice(0); // copying by value
        
  //       let docNumToCheck = generalTermsArray[runnerIndex].locations[0].documentNumber;
  //       let docAlreadyExistsInArray = checkIfSameDocNumberExists(generalTermsArray[keyIndex] , docNumToCheck); // function returns bool variable
  
  //       if (docAlreadyExistsInArray) {
  //         for (let i = 0 ; i < generalTermsArray[keyIndex].locations.length ; i++) {  //in order to find array and update 'hits'
  //           if (tmpTerm.locations[i].documentNumber === docNumToCheck)  // update tmpTerm 'hits' value
  //             tmpTerm.locations[i].hits++;
  //         }
  //       }
  //       else  // docNumber doesnt exists in the locations array
  //         tmpTerm.locations.push((generalTermsArray[runnerIndex].locations[0]).splice(0));
  
  //       runnerIndex++;
  //     }
  //     else if (generalTermsArray[runnerIndex] != undefined){  // No more occurensses to the term 'generalTermsArray[keyIndex]'
  //       let numOfElementsToDelete;
  //       numOfElementsToDelete = runnerIndex - keyIndex;
  //       if (numOfElementsToDelete === 0)
  //         continue;
  //       else {
  //         generalTermsArray.splice(keyIndex + 1 , numOfElementsToDelete ); // leaving only the updated first term, erasing all duplicated terms.
  //         runnerIndex = ++keyIndex;
  //         // console.log("\n\nTMP CHECK");
  //       }
  //     }
  //   }
  
  //   return mergedArray;
  // }