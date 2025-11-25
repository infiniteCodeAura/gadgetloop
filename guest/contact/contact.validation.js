import yup from "yup";

export const contactValidationSchema = yup.object({
    name: yup
        .string()
        .required("Name is required")
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .test("no-xss", "Invalid characters in name", (value) =>
            value ? !/<script.*?>.*?<\/script>/gi.test(value) : true
        ),

    email: yup
        .string()
        .required("Email is required")
        .trim()
        .lowercase()
        .email("Please enter a valid email address")
        .max(255, "Email must not exceed 255 characters"),

    subject: yup
        .string()
        .required("Subject is required")
        .trim()
        .min(5, "Subject must be at least 5 characters")
        .max(200, "Subject must not exceed 200 characters")
        .test("no-xss", "Invalid characters in subject", (value) =>
            value ? !/<script.*?>.*?<\/script>/gi.test(value) : true
        ),

    message: yup
        .string()
        .required("Message is required")
        .trim()
        .min(10, "Message must be at least 10 characters")
        .max(1000, "Message must not exceed 1000 characters")
        .test("no-xss", "Invalid characters in message", (value) =>
            value ? !/<script.*?>.*?<\/script>/gi.test(value) : true
        ),
});
