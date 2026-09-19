import axios from "axios";

const candidatePasswords = [
  "Admin123!",
  "SuperAdmin123!",
  "Admin@123",
  "Admin@123456",
  "Password123!",
  "FieldCam123!",
  "12345678",
  "admin123",
  "SuperAdmin@123",
  "superadmin",
  "admin",
  "password123",
  "FieldCam2026!",
  "Fieldcam123!",
];

async function testPasswords() {
  for (const email of ["superadmin@gmail.com", "admin@gmail.com"]) {
    for (const pwd of candidatePasswords) {
      try {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password: pwd,
        });
        console.log(`✅ FOUND SUCCESSFUL LOGIN! Email: ${email}, Password: "${pwd}"`);
        console.log("Token:", res.data.data?.accessToken);
        return { email, pwd, token: res.data.data?.accessToken };
      } catch (err) {
        // try next
      }
    }
  }
  console.log("None of the common candidate passwords matched.");
}

testPasswords();
