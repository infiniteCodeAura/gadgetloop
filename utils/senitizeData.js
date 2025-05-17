import sanitizeHtml from "sanitize-html";
import validator from "validator"
export const sanitizeData = (input)=>{
    let data = input?.trim()|| "";
    data = validator.escape(data);
    data = sanitizeHtml(data,{
        allowedTags: [],
        allowedAttributes: {},
    })
    return data
}

export const emailSenitize = (input)=>{
    let rawEmail = input?.toString().trim() || "";
    //sanitize email 
    let email = sanitizeHtml(rawEmail,{
        allowedTags: [],
        allowedAttributes: {},
    })
    //email validator 
    email = validator.normalizeEmail(email);

    return email;

}


