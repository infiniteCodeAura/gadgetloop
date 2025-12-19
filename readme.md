
key = kfjkjkjfsdfkjjkjfdnujvfvkcnvlkdfjgruigi
ipKey = http://ip-api.com/json/
appPassword =  .......
uName = 
password = 
dbname = gadgetLoop
port = 9090
otpKey = vnjdfluarhgjnvkldjfbvkdjhgkldjfghksdjfgnkjdhgjhfkdgd

//mail 
gmail = wwwghimiresagar88@gmail.com





Start
2. Signup Flow
Input: Name, Email, Password, Role (Buyer/Seller)

🔽 Check if email already exists

✔️ No → Proceed 

❌ Yes → Show “User already exists”

🔽 Hash the password using bcrypt

🔽 Sanitize and validate input fields (name, email, etc.)

🔽 Generate JWT Token (include user info and role)

🔽 Save user in database with:

Name

Email

Hashed Password

Role (Buyer/Seller)

LastLoginDevice = current user device

NameUpdatedAt = null

✅ Respond: “Signup successful”, return JWT token

3. Login Flow
Input: Email, Password

🔽 Find user by email

❌ Not found → Respond “Invalid credentials”

🔽 Compare password with hashed one

❌ Invalid → Respond “Invalid credentials”

🔽 Generate JWT Token (user ID + role)

🔽 Detect device info (user-agent or fingerprint)

🔽 Compare with LastLoginDevice

✔️ Same → Proceed

❌ Different → Send email alert ("Suspicious Login Detected")

🔽 Update LastLoginDevice = current device

✅ Respond: “Login successful”, return JWT token

4. Rate Limiting
✔️ Limit login attempts using express-rate-limit (e.g., 1 attempt per 15 mins)

5. JWT Verification Middleware (isUser, isBuyer, isSeller)
🔽 Extract JWT from headers

🔽 Decode & verify token using jwt.verify()

🔽 Check if user exists

❌ Not found → Respond “Unauthorized”

🔽 Match role if route requires specific role

✅ Add req.userId and req.userData to request object

✅ Call next() to proceed

6. Profile Name Update Flow
Input: new name

🔽 Check NameUpdatedAt

✔️ If 15 days passed OR null → Proceed

❌ If not → Respond “You can update name every 15 days”

🔽 Update name

🔽 Set NameUpdatedAt = now()

✅ Respond: “Name updated successfully”

7. Profile Email Update
Input: new email

🔽 Check if email already exists

🔽 Validate & sanitize new email

🔽 Update in DB

✅ Respond: "Email updated successfully"

8. Profile Picture Upload
Input: File (image)

🔽 Use multer to store image in ./upload/profiles/

🔽 Save image path to user profile

✅ Respond: "Profile image updated"

9. Forgot Password Flow
Input: Email, New Password

🔽 Validate and sanitize email & password

🔽 Check if email exists

❌ No → Respond: "User not found"

🔽 Hash new password

🔽 Update password

✅ Respond: "Password updated successfully"

10. Product Add (Seller)
Input: Product name, description, price, brand, etc.

🔽 Validate all fields using yupAddProduct

🔽 Sanitize product fields

🔽 Save product to DB

✅ Respond: "Product added"

11. Sanitization Layer
✔️ All input fields sanitized using:

validator.escape()

sanitize-html

Custom logic for numbers, email, etc.

12. Bad Word Filter
✔️ Maintained array of banned words (e.g., vulgar/offensive names)

🔽 Reject names containing any banned words (e.g., “mula”)

✅ Respond: “Name does not meet our privacy policy and community guidelines”

13. API Versioning
✔️ v1 for user routes

✔️ v2 for seller routes

✔️ v3 for buyer routes
