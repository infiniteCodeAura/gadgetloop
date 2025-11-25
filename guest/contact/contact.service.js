import { sanitizeData, emailSanitize } from "../../utils/sanitizeData.js";
import { Contact } from "./contact.model.js";
import { contactValidationSchema } from "./contact.validation.js";

/**
 * Validate contact form data
 */
export const validateContact = async (req, res, next) => {
    const { name, email, subject, message } = req.body;

    try {
        await contactValidationSchema.validate(
            { name, email, subject, message },
            { abortEarly: false }
        );
        next();
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Submit contact form
 */
export const submitContact = async (req, res) => {
    let { name, email, subject, message } = req.body;

    try {
        // Sanitize all inputs
        name = sanitizeData(name);
        email = emailSanitize(email);
        subject = sanitizeData(subject);
        message = sanitizeData(message);

        // Create contact message
        const contactMessage = await Contact.create({
            name,
            email,
            subject,
            message,
        });

        return res.status(200).json({
            message: "Thank you for contacting us! We'll get back to you soon.",
            data: {
                id: contactMessage._id,
                createdAt: contactMessage.createdAt,
            },
        });
    } catch (error) {
        console.error("Contact submission error:", error);
        return res.status(500).json({
            message: "Failed to submit your message. Please try again later.",
        });
    }
};
