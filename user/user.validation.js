import yup from "yup";

export let yupSignupValidation = yup.object({

firstName: yup.string().required("First name is required. ").trim(),
lastName : yup.string().required("Last name is required. ").trim(),
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
