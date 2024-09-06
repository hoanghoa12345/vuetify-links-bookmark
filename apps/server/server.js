"use strict";

const express = require("express");
const fs = require("fs");
const dynamoose = require("dynamoose");
const bcrypt = require("bcrypt");
const uuid = require("utils");
var jwt = require("jsonwebtoken");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const saltRounds = 10;
const secretKey = "local-secret-key";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});

const ddb = new dynamoose.aws.ddb.DynamoDB({
  credentials: {
    accessKeyId: "AKID",
    secretAccessKey: "SECRET",
  },
  region: "us-east-1",
  endpoint: "http://localhost:8001",
});

dynamoose.aws.ddb.set(ddb);

const userSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    default: () => uuid(),
  },
  name: {
    type: String,
    validate: (val) => {
      return val.length > 4 && val.length < 50;
    },
  },
  email: {
    type: String,
    index: true,
    validate: /^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/,
  },
  password: String,
  role: {
    type: String,
    default: "user",
  },
  avatar: {
    type: String,
    required: false,
  },
  createdAt: {
    type: String,
    default: () => {
      return new Date().toISOString();
    },
  },
  updatedAt: {
    type: String,
    default: () => {
      return new Date().toISOString();
    },
  },
});

const User = dynamoose.model("User", userSchema);

const bookmarkSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    default: () => uuid(),
  },
  linkUrl: {
    type: String,
    required: true,
    validate:
      /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?/,
  },
  title: {
    type: String,
    required: true,
    validate: (val) => {
      return val.length > 4 && val.length < 250;
    },
  },
  description: {
    type: String,
    required: true,
    validate: (val) => {
      return val.length > 4 && val.length < 550;
    },
  },
  tags: {
    type: Array,
    required: false,
  },
  thumbnail: {
    type: String,
    required: false,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: String,
    default: () => {
      return new Date().toISOString();
    },
  },
  updatedAt: {
    type: String,
    default: () => {
      return new Date().toISOString();
    },
  },
});

const Bookmark = dynamoose.model("Bookmark", bookmarkSchema);

const dataPath = "./db.json";

const jsonResponse = (res, status = 200, data) => {
  res.status(status).send({
    success: true,
    data: data,
    message: "Data retrieved successfully",
  });
};

const errorResponse = (res, status = 500, error) => {
  res.status(status).send({
    success: false,
    errors: error,
  });
};

const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    secretKey,
    {
      expiresIn: "1h",
    }
  );
};

// const verifyToken = (token) => {
//   return jwt.verify(token, secretKey);
// };

const verifyTokenMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated");
  }
};

const authRouter = express.Router();
authRouter.post("/register", async function(req, res) {
  const user = new User(req.body);

  user.password = await bcrypt.hash(user.password, saltRounds);

  try {
    const userExist = await User.query("email").eq(user.email).exec();
    if (userExist.length > 0) {
      errorResponse(res, 400, "User already exist");
    } else {
      await user.save();
      jsonResponse(res, 201, user);
    }
  } catch (error) {
    errorResponse(res, 500, error);
  }
});

authRouter.post("/login", async function(req, res) {
  const user = await User.query("email").eq(req.body.email).exec();
  if (user.length > 0) {
    const isMatch = await bcrypt.compare(req.body.password, user[0].password);
    if (isMatch) {
      const token = signToken(user[0]);
      jsonResponse(res, 200, { user: user[0], token: token });
    } else {
      errorResponse(res, 400, "Password is incorrect");
    }
  } else {
    errorResponse(res, 400, "User does not exist");
  }
});

authRouter.patch(
  "/update-profile",
  verifyTokenMiddleware,
  async function(req, res) {
    const user = await User.query("id").eq(req.body.id).exec();
    if (user.length > 0) {
      user[0].name = req.body.name;
      user[0].avatar = req.body.avatar;
      user[0].updatedAt = new Date().toISOString();
      await user[0].save();
      jsonResponse(res, 200, user[0]);
    } else {
      errorResponse(res, 400, "User does not exist");
    }
  }
);

authRouter.patch("/change-password", async function(req, res) {
  const user = await User.query("id").eq(req.body.id).exec();
  if (user.length > 0) {
    user[0].password = await bcrypt.hash(req.body.password, saltRounds);
    user[0].updatedAt = new Date().toISOString();
    await user[0].save();
    jsonResponse(res, 200, user[0]);
  } else {
    errorResponse(res, 400, "User does not exist");
  }
});

authRouter.get("/profile", verifyTokenMiddleware, async function(req, res) {
  const user = await User.query("id").eq(req.user.id).exec();
  if (user.length > 0) {
    jsonResponse(res, 200, user[0]);
  } else {
    errorResponse(res, 400, "User does not exist");
  }
});

const bookmarkRouter = express.Router();
bookmarkRouter.get("/", async function(req, res) {
  try {
    const bookmarks = await Bookmark.query("userId").eq(req.user.id).exec();
    jsonResponse(res, 200, bookmarks);
  } catch (error) {
    errorResponse(res, 500, error);
  }
});

bookmarkRouter.post("/", async function(req, res) {
  const bookmark = new Bookmark(req.body);
  try {
    await bookmark.save();
    jsonResponse(res, 201, bookmark);
  } catch (error) {
    errorResponse(res, 500, error);
  }
});

bookmarkRouter.patch("/:id", async function(req, res) {
  const userId = req.user.id;
  const bookmark = await Bookmark.query("id").eq(req.params.id).exec();
  if (bookmark.length > 0) {
    // Check user is owner of bookmark
    if (bookmark[0].userId == userId) {
      bookmark[0].title = req.body.title;
      bookmark[0].description = req.body.description;
      bookmark[0].url = req.body.url;
      bookmark[0].thumbnail = req.body.thumbnail;
      bookmark[0].tags = req.body.tags;
      await bookmark[0].save();
      jsonResponse(res, 200, bookmark[0]);
    } else {
      errorResponse(res, 400, "You are not owner of this bookmark");
    }
  }
});

bookmarkRouter.delete("/:id", async function(req, res) {
  const userId = req.user.id;
  const bookmark = await Bookmark.query("id").eq(req.params.id).exec();
  if (bookmark.length > 0) {
    // Check user is owner of bookmark
    if (bookmark[0].userId == userId) {
      await bookmark[0].delete();
      jsonResponse(res, 200, "Bookmark deleted successfully");
    } else {
      errorResponse(res, 400, "You are not owner of this bookmark");
    }
  }
});

app.get("/api/info", function(_req, res) {
  const info = getInfoData();
  let list = new Array();
  Object.keys(info).map(function(key) {
    list.push(info[key]);
  });

  res.send(list);
});

app.post("/api/info", function(req, res) {
  var existPages = getInfoData();
  const newRecordId = Math.floor(100000 + Math.random() * 900000);

  existPages[newRecordId] = req.body;

  console.log(req.body);

  console.log(existPages);
  saveInfoData(existPages);
  res.send({ success: true, msg: "Page added successfully" });
});

app.put("/api/info/:id", function(req, res) {
  var existPages = getInfoData();
  fs.readFile(
    dataPath,
    "utf8",
    (err, data) => {
      console.log(err, data);
      const recordId = req.params["id"];
      existPages[recordId] = req.body;
      saveInfoData(existPages);
      res.send(`Page with id ${recordId} has been updated`);
    },
    true
  );
});

app.delete("/api/info/:id", function(req, res) {
  fs.readFile(
    dataPath,
    "utf8",
    (err, data) => {
      console.log(err, data);
      var existPages = getInfoData();
      const recordId = req.params["id"];
      delete existPages[recordId];
      saveInfoData(existPages);
      res.send(`Page with id ${recordId} has been deleted`);
    },
    true
  );
});

const saveInfoData = (data) => {
  const stringifyData = JSON.stringify(data);
  fs.writeFileSync(dataPath, stringifyData);
};

const getInfoData = () => {
  const jsonData = fs.readFileSync(dataPath);
  return JSON.parse(jsonData);
};

app.use("/api/auth", authRouter);
app.use("/api/bookmarks", verifyTokenMiddleware, bookmarkRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = 5000;

app.listen(port, () => {
  console.log("Express started on port %d", port);
});
