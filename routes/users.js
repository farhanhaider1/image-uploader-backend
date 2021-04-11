const express = require("express");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");
const AWS = require("aws-sdk");
const { v4: uuid } = require("uuid"); //! to create random ID's for image
const { getImageUrls } = require("../utils/awsS3");
const router = express.Router();

//! create new AWS s3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
  signatureVersion: "v4",
  region: "us-east-2",
});

router.post("/new", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(403).send(error.details[0].message);

  //extract data from the req's body
  let { name, username, email, password } = req.body;
  // lowercase data
  name = name.trim().toLowerCase();
  email = email.trim().toLowerCase();

  //if schema is validated
  // search if username or/and email already exists
  let user = await User.find().or([{ username: username }, { email: email }]);
  if (user && user.length > 0) {
    console.log(user);
    return res.status(400).send("User already registered.");
  }

  // hash password for security
  const salt = await bcrypt.genSalt(9);
  password = await bcrypt.hash(password, salt);

  user = new User({
    name: name,
    username: username,
    email: email,
    password: password,
  });
  await user.save();
  res.status(200).send(user);
});

router.get("/auth", async (req, res) => {
  const { username, password } = req.query;
  // find if username exists
  let user = await User.findOne({ username: username }).select("-_id");

  if (!user) {
    return res.status(403).send("Wrong username or password");
  }
  const hashedPassword = await bcrypt.compare(password, user.password);
  if (hashedPassword) {
    const data = {
      name: user.name,
      username: user.username,
    };
    return res.status(200).send(data);
  } else if (!hashedPassword) {
    return res.status(403).send("Wrong username or password");
  }

  return res.status(403).send("Wrong username or password");
});

// * upload posts for specific user
router.post("/upload", async (req, res) => {
  const dateAdded = Date.now();
  // ? change from base64 to buffer
  const buf = Buffer.from(
    req.body.img.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  console.log(buf);

  //? create params for s3 bucket and pass the buffer to Body param
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuid()}.jpeg`,
    Body: buf,
  };

  //* upload...
  //! promise() is required. await alone won't work
  const stored = await s3.upload(params).promise();
  //* store returned key
  const key = stored.Key;

  //* save returned key under correct user posts
  const { username } = req.body;
  //push new post in
  await User.updateOne(
    { username: username },
    {
      $push: {
        posts: {
          key: key,
          dateAdded: dateAdded,
        },
      },
    }
  );

  res.status(200).header("Access-Control-Allow-Origin", "*").send("uploaded");
});

//* return all posts for a given user

router.get("/posts", async (req, res) => {
  const { username } = req.query;
  try {
    let postKeys = await User.findOne(
      { username: username },
      { posts: { $slice: [0, 10] } }
    ).select("-_id");
    console.log(postKeys);
    let keys = [];
    // postKeys.posts.map((posts) => keys.push({ key: posts.key }));
    let i;
    for (i = postKeys.posts.length - 1; i >= 0; i--) {
      keys.push({ key: postKeys.posts[i].key });
    }
    console.log(keys);
    const postUrls = await getImageUrls(keys, s3);
    res.status(200).send(postUrls);
    // res.status(200).send([]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
