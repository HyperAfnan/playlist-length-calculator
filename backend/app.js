const express = require('express');
const app = express();
require("dotenv").config();
const cors = require('cors')
const PORT = process.env.PORT
const KEY = process.env.API_KEY
const URL1 = process.env.URL1
const URL2 = process.env.URL2
const URL3 = process.env.URL3

app.use(cors());

function parseDuration(duration) {
   let hours = 0;
   let minutes = 0;
   let seconds = 0;

   const hoursMatch = duration.match(/(\d+)H/);
   if (hoursMatch) hours = parseInt(hoursMatch[1]);

   const minutesMatch = duration.match(/(\d+)M/);
   if (minutesMatch) minutes = parseInt(minutesMatch[1]);

   const secondsMatch = duration.match(/(\d+)S/);
   if (secondsMatch) seconds = parseInt(secondsMatch[1]);

   return { hours, minutes, seconds };
}

app.get("/data", async (req, res) => {
   const response = { duration: { hours: 0, minutes: 0, seconds: 0 } }
   const playlistId = req.query.id
   const watched = req.query.watched
   try {
      const playlistDataResponse = await fetch(`${URL3}?key=${KEY}&part=snippet&id=${playlistId}`);
      const playlistData = await playlistDataResponse.json();
      response.playlistName = playlistData.items[0].snippet.title;
      response.channelName = playlistData.items[0].snippet.channelTitle;
      response.thumbnail = playlistData.items[0].snippet.thumbnails.maxres.url;

      const playlistListResponse = await fetch(`${URL1}?key=${KEY}&part=contentDetails,snippet&maxResults=50&playlistId=${playlistId}&maxResults=50`);
      const playlistListData = await playlistListResponse.json();
      response.totalVideos = playlistListData.pageInfo.totalResults;

      const videoPromises = playlistListData.items.map(async (item) => {
         const videoId = item.contentDetails.videoId;
         const videoResponse = await fetch(`${URL2}?key=${KEY}&part=contentDetails&id=${videoId}`);
         const videoData = await videoResponse.json();


         if (videoData.items && videoData.items.length > 0) {
            return parseDuration(videoData.items[0].contentDetails.duration);
         }
         return response.duration = { hours: 0, minutes: 0, seconds: 0 };

      });

      const videoDurations = await Promise.all(videoPromises);
      if (watched != undefined) {
         videoDurations.splice(0, watched)
      }

      let totalSeconds = 0;
      videoDurations.forEach(vid => {
         totalSeconds += (vid.hours * 3600) + (vid.minutes * 60) + vid.seconds;
      });

      response.duration.hours = Math.floor(totalSeconds / 3600);
      response.duration.minutes = Math.floor((totalSeconds % 3600) / 60);
      response.duration.seconds = totalSeconds % 60;

      res.json(response);
   } catch (err) {
      console.error(`Error: ${err}`);
      res.status(500).json({ error: 'An error occurred while processing your request' });
   }
});

app.listen(PORT, () => {
   console.log(`App running on port ${PORT}`)
})
