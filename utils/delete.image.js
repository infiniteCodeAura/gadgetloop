import fs from "fs";
import path from "path"
import { fileURLToPath } from "url";

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//delete function 
export function deleteUploadFile(filename){
    const filePath = path.join(__dirname,"../upload/profiles",filename);


    fs.unlink(filePath,(err)=>{

  if (err) {
      console.error('Failed to delete file:', err);
    } else {
      console.log('File deleted:', filename);
    }

    })


}

