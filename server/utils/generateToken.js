import jwt from "jsonwebtoken"

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d", // Use JWT_EXPIRE from .env or default to 30 days
  })
}

export default generateToken;
