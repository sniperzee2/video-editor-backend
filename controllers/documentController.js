const fs = require('fs');
const path = require('path');
const gTTS = require('gtts');
const videoShow = require('videoshow')
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const { exec } = require('child_process')

exports.uploadDocuments = async (req, res) => {
    try {
        const file_path = `/Documents/${req.file.filename.replace(/ /g, "_")}`
        const user = req.user;
        user.documents.push(file_path);
        await user.save();
        res.status(201).json({
            status: "ok",
            file_path: file_path
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "fail",
            message: "Internal server error"
        })
    }
}

exports.textToAudio = async (req, res) => {
    try {
        const { file } = req.body;
        var text;
        fs.readFile(`${file}`, 'utf8', function (err, data) {
            if (err) throw err;
            text = data.toString();
            var speech = new gTTS(text, 'en');
            var fileName = `converted_` + Date.now();
            speech.save(`Documents/${fileName}.mp3`, async (err, result) => {
                if (err) { throw new Error(err) }
                else {
                    const file_path = `/Documents/${fileName}.mp3`
                    const user = req.user;
                    user.convertedFiles.push(file_path);
                    await user.save();
                    res.status(200).json({
                        status: "ok",
                        message: "text to speech converted",
                        audio_file_path: "/Documents/" + fileName + ".mp3"
                    })
                }
            })
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "fail",
            message: "Internal server error"
        })
    }
}

exports.getAllDocs = async (req, res) => {
    try {
        const user = req.user;
        const docs = user.documents;

        res.status(200).json({
            status: "ok",
            data: docs
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "fail",
            message: "Internal server error"
        })
    }
}

exports.downloadFile = async (req, res) => {
    try {
        const { file_path } = req.query;
        const file = path.join(__dirname, '..', file_path);
        res.download(file);
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "fail",
            message: "Internal server error"
        })
    }
}

exports.imageAudioMerge = async (req, res) => {
    try {
        const { image_file_path, audio_file_path } = req.body;
        const user = req.user;
        var images = [`${path.join(__dirname, '..', `${image_file_path}`)}`];
        var videoPath = `/Documents/${Date.now()}_merged.mp4`
        var videoOptions = {
            fps: 25,
            loop: 10,
            transition: true,
            transitionDuration: 1,
            videoBitrate: 1024,
            videoCodec: 'libx264',
            size: '640x?',
            audioBitrate: '128k',
            audioChannels: 2,
            audioCodec: 'aac',
            format: 'mp4',
            pixelFormat: 'yuv420p',
        }
        videoShow(images, videoOptions)
            .audio(`${path.join(__dirname, '..', `${audio_file_path}`)}`)
            .save(`${path.join(__dirname, '..', `${videoPath}`)}`)
            .on('start', function (file) {
                console.log('ffmpeg process started');
            })
            .on('error', function (err, stdout, stderr) {
                console.error('Error:', err)
                console.error('ffmpeg stderr:', stderr)
                res.status(400).json({
                    status: "Failed",
                    message: "Failed to merge audio and image"
                })
            })
            .on('end', async function () {
                console.log('file converted successfully');
                user.convertedFiles.push(videoPath);
                await user.save();
                res.status(200).json({
                    status: "ok",
                    message: "file converted successfully",
                    video_file_path: videoPath
                })
            })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "fail",
            message: "Internal server error"
        })
    }
}

exports.videoAudioMerge = async (req, res) => {
    try {
        let output = ""
        var flag = false
        const { video_file_path, audio_file_path } = req.body;

        output =`/Documents/${Date.now()}_output.mp4`;
        const video = '.'+video_file_path
        const audio = '.'+audio_file_path

        exec(`ffmpeg -i ${video} -stream_loop -1 -i ${audio} -map 0:v -map 1:a -c copy -shortest .${output}`, (err, stderr, setdout) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log("conversion completed")
                const user = req.user;
                user.convertedFiles.push(output);
                user.save();
                res.status(200).json({
                    status: "ok",
                    message: "file converted successfully",
                    video_file_path: output
                })
                flag = true
            }
        });

        if (flag) {

            res.download(output, () => {
                console.log("file is downloaded")
            })

        }

    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: "fail",
            message: "Internal server error"
        })
    }
}

exports.mergeVideos = async (req, res) => {
    const { video_file_path_list } = req.body;

    let videoStitch = require('video-stitch');

    let videoConcat = videoStitch.concat;

    let array = []
    for (var i = 0; i < video_file_path_list.length; i++) {
        array.push({
            fileName: video_file_path_list[i]
        })
    }

    console.log("Array", array)
    let output = `./Documents/${Date.now()}_output.mp4`
    let link = `/Documents/${Date.now()}_output.mp4`

    videoConcat()
        .clips(array)
        .output(output)
        .concat()
        .then((outputFileName) => {
            console.log(outputFileName)
            const user = req.user;
            user.convertedFiles.push(output);
            user.save();
            res.status(200).json({
                status: "ok",
                message: "file converted successfully",
                video_file_path: link
            })
        }).catch((err) => {
            console.log(err)
            res.status(500).json({
                status: "fail",
                message: "Internal server error"
            })
        });
}