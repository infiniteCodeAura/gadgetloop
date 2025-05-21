import yup from "yup";
import { bannedNames } from "../additional/blacklist_name/name.blacklist.js";

export let yupSignupValidation = yup.object({

firstName: yup.string().required("First name is required. ").trim().notOneOf(bannedNames,"This name is prohibited because it violates our privacy standards and community conduct rules. Please choose a different username."),
lastName : yup.string().required("Last name is required. ").trim().notOneOf(bannedNames,"This name is prohibited because it violates our privacy standards and community conduct rules. Please choose a different username."),
email: yup.string().required("Email is required. ").trim().email("Please enter a valid email."),
password: yup
      .string()
      .required("New password is required.")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        "Password must be at least 6 characters and include uppercase, lowercase, number, and special character."
      ),



role:yup.string().required("User role is required. ").oneOf(["buyer","seller"]) 

})

//user profile update validation

export let yupPhotoValidation = yup.object({

profile: yup.string().required("Profile is required. ").trim().max(1,"only one photo is allowed")

})
