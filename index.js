const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/video", (req, res) => {
    const range = req.headers.range;
    if (!range) {
        return res.status(400).send("Requires Range header");
    }

    const videoFilePath = path.join(__dirname, "Marvels SpiderMan.mp4");
    fs.stat(videoFilePath, (err, stats) => {
        if (err) {
            console.error("Could not get video file stats", err);
            return res.status(404).send("Video file not found");
        }

        const videoSize = stats.size;
        const chunkSize = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + chunkSize, videoSize - 1);

        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        };

        res.writeHead(206, headers);

        const videoStream = fs.createReadStream(videoFilePath, { start, end });
        videoStream.on("open", () => {
            videoStream.pipe(res);
        });
        videoStream.on("error", (err) => {
            console.error("Error streaming video", err);
            res.end(err);
        });
    });
});

app.listen(8000, () => {
    console.log("Server is listening on port 8000!");
});
