//!

//* fetch signed image url from keys for every image in the bucket
exports.getImageUrls = async (keys, s3) => {
  const urls = [];
  const signedUrlExpireSeconds = 1800; //--> in seconds (30 mins)
  keys.map((key) => {
    var params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key.key,
      Expires: signedUrlExpireSeconds,
    };
    let url = s3.getSignedUrl("getObject", params);
    urls.push(url);
  });

  return urls;
};
