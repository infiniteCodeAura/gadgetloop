import sanitizeHtml from "sanitize-html";
export const sanitizeData = (input)=>{
    let data = input?.trim()|| "";
    data = validateForgotPasswordData.escape(data);
    data = sanitizeHtml(data,{
        allowedTags: [],
        allowedAttributes: {},
    })
}
