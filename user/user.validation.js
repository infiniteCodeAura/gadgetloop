import yup, { string } from "yup";

export let yupSignupValidation = yup.object({

firstName: string().required("First name is required. ").trim(),
lastName : string().required("Last name is required. ").trim(),
email: string().required("Email is required. ").trim().email("Please enter a valid email."),
password: string().required("Password is required. ").trim(),
role:string().required("User role is required. ").oneOf(["buyer","seller"]) 

})

//user profile update validation

export let yupPhotoValidation = yup.object({

profile: yup.string().required("Profile is required. ").trim().max(1,"only one photo is allowed")

})
