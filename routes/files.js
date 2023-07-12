const router = require('express').Router()
const multer = require('multer')
const {
  v4: uuid4
} = require('uuid')
const path = require('path')
const File = require('../models/file');
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqname = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqname)
  }
})

let upload = multer({
  storage:storage,
  limits: {
    fileSize: 100000 * 100 // 100 MB
  }
}).single('myFile')

router.post('/', (req, res) => {

  upload(req, res, async (err) => {

    if (!req.file) {
      return res.status(400).json({
        error: 'File missing'
      })
    }

    if (err) {
      return res.status(500).send({
        error: err.message
      })
    }
    const file = new File({
      filename: req.file.filename,
      uuid: uuid4(),
      path: req.file.path,
      size: req.file.size
    })

    const response = await file.save();
    return res.json({file:`${process.env.APP_BASE_URL}/files/${response.uuid}`});
    


});

    //Store file

    //Store into Database

    //Response ->Link
});
router.post('/send', async (req, res) => {
  const { uuid, emailTo, emailFrom, expiresIn } = req.body;
  if(!uuid || !emailTo || !emailFrom) {
      return res.status(422).send({ error: 'All fields are required except expiry.'});
  }
  // Get data from db 
  
    const file = await File.findOne({ uuid: uuid });
    if(file.sender) {
      return res.status(422).send({ error: 'Email already sent once.'});
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    // send mail
    const sendMail = require('../services/emailService');
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: 'inShare file sharing',
      text: `${emailFrom} shared a file with you.`,
      html: require('../services/emailTemplate')({
                emailFrom, 
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email` ,
                size: parseInt(file.size/1000) + ' KB',
                expires: '24 hours'
            })
    });
    return res.send({success:true});

});

module.exports = router;