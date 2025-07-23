const mailjet = require ('node-mailjet')
	.apiConnect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)

const sendEmail = async options  => {
  try{
    mailjet
    .post("send", {'version': 'v3.1'})
    .request({
      "Messages":[
          {
              "From": {
                  "Email": "support@mrattireco.com",
                  "Name": "Mr Attire"
              },
              "To": [
                  {
                      "Email": options.email
                  }
              ],
              "Subject": options.subject,
              "TextPart": options.message
          }
      ]
    })
  } catch(err) {
    console.log(err)
  }
}

module.exports = sendEmail;