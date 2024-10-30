import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  //token from header
  const token = req.headers.authorization;

  //error isf no token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  //deCode the token and verify
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //set User details from the decoded token to req.body
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;
