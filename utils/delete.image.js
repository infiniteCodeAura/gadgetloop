import fs from "fs";
import path from "path"


//delete function 
 function deleteUploadFile(filename){
    const filePath = path.join(__dirname,"upload/profiles",filename);


    fs.unlink(filePath,(err)=>{

  if (err) {
      console.error('Failed to delete file:', err);
    } else {
      console.log('File deleted:', filename);
    }

    })


}

module.exports = {deleteUploadFile}