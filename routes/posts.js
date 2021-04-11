const { Post } = require("../models/post");
const express = require("express");
const router = express();
const AWS = require("aws-sdk");
const { getImageUrls } = require("../utils/awsS3");

//! create new AWS s3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
  signatureVersion: "v4",
  region: "us-east-2",
});

//* return all posts for a given user
//todo add user
router.get("/get", async (req, res) => {
  try {
    const postKeys = await Post.find()
      .sort("-dateAdded")
      .select("key -_id")
      .limit(30);
    console.log(postKeys);
    const postUrls = await getImageUrls(postKeys, s3);
    res.status(200).send(postUrls);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
