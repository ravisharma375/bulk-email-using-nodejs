var router = require("express").Router();
var async = require("async");
var http = require("http");

var nodemailer = require("nodemailer");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Bulk Email Created By Ravi Sharma" });
});
// router.post("/sendEmail", (req, res) => {
//   // return res.json({
//   //   error: false,
//   //   message: req.body,
//   // });
// });
router.post("/sendEmail", function (req, res) {
  const { body } = req;
  const email = body.listemail;
  const subject = body.subject;
  const message = body.message;
  const listofemails = email.split(",");
  console.log(listofemails, subject, message);

  // This will store emails needed to send.
  // We can fetch it from DB (MySQL,Mongo) and store here.
  // var listofemails = ["sharamaravi65@gmail.com", "ravisharama375@gmail.com"];
  // Will store email sent successfully.
  var success_email = [];
  // Will store email whose sending is failed.
  var failure_email = [];

  var transporter;

  /* Loading modules done. */

  function massMailer() {
    var self = this;
    transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "Use Your Email Id", //Use Your Email Id
        pass: "Use Your password", //Use Your password
      },
    });
    // Fetch all the emails from database and push it in listofemails
    // Will do it later.
    self.invokeOperation();
  }

  /* Invoking email sending operation at once */

  massMailer.prototype.invokeOperation = function () {
    var self = this;
    async.each(listofemails, self.SendEmail, function () {
      console.log(success_email);
      console.log(failure_email);
      console.log("list of email", listofemails.length);
      console.log("send maail", self.SendEmail);
    });
  };

  /*
   * This function will be called by multiple instance.
   * Each instance will contain one email ID
   * After successfull email operation, it will be pushed in failed or success array.
   */

  massMailer.prototype.SendEmail = function (Email, callback) {
    console.log("Sending email to " + Email);
    var self = this;
    self.status = false;
    // waterfall will go one after another
    // So first email will be sent
    // Callback will jump us to next function
    // in that we will update DB
    // Once done that instance is done.
    // Once every instance is done final callback will be called.
    async.waterfall(
      [
        function (callback) {
          var mailOptions = {
            from: "shahid@codeforgeek.com",
            to: Email,
            subject: `${subject}`,
            text: `${message}`,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              failure_email.push(Email);
            } else {
              self.status = true;
              success_email.push(Email);
            }
            callback(null, self.status, Email);
          });
        },
        function (statusCode, Email, callback) {
          console.log(
            "Will update DB here for " + Email + "With " + statusCode
          );
          callback();
        },
      ],
      function () {
        //When everything is done return back to caller.
        callback();
      }
    );
  };
  console.log("sucess", success_email);
  new massMailer(); //lets begin
});

module.exports = router;
