const router = require('express').Router();
const {uploadDocuments,textToAudio,getAllDocs,downloadFile,imageAudioMerge,videoAudioMerge,mergeVideos} = require('../controllers/documentController');
const {authPass} = require('../middlewares/auth');
const upload = require('../middlewares/multer');

router.post('/upload_file', upload.single("file"),authPass, uploadDocuments);
router.post('/text_to_audio',authPass, textToAudio);
router.get('/my_upload_file',authPass, getAllDocs);
router.get('/download_file', downloadFile);
router.post('/merge_image_and_audio',authPass, imageAudioMerge);
router.post('/merge_video_and_audio',authPass, videoAudioMerge);
router.post('/merge_videos',authPass, mergeVideos);

module.exports = router;
