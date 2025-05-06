const express = require('express');
const app = express();
const rateLimit = require("express-rate-limit")
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY;
const YOUTUBE_PLAYLIST_DATA = process.env.URL1;
const YOUTUBE_VIDEO_METADATA = process.env.URL2;
const YOUTUBE_PLAYLIST_METADATA = process.env.URL3;
const path = require('path');

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));

/**
 * Rate limiting middleware to prevent API abuse
 * Limits to 50 requests per IP address in a 15-minute window
 */
app.use(rateLimit({
   windowMs: 15 * 60 * 1000,
   max: 50,
   standardHeaders: true,
   legacyHeaders: false,
   message: { error: "Too many requests, rate limit exceeded" }
}))

/**
 * Parses YouTube duration format (ISO 8601) into hours, minutes, and seconds
 * @param {string} duration - Duration string in ISO 8601 format (e.g., "PT1H30M15S")
 * @returns {{hours: number, minutes: number, seconds: number}} - Object containing parsed duration
 */
function parseDuration(duration) {
   let hours = 0;
   let minutes = 0;
   let seconds = 0;

   // Extract hours if present (e.g., "1H" from "PT1H30M15S")
   const hoursMatch = duration.match(/(\d+)H/);
   if (hoursMatch) hours = parseInt(hoursMatch[1]);

   // Extract minutes if present (e.g., "30M" from "PT1H30M15S")
   const minutesMatch = duration.match(/(\d+)M/);
   if (minutesMatch) minutes = parseInt(minutesMatch[1]);

   // Extract seconds if present (e.g., "15S" from "PT1H30M15S")
   const secondsMatch = duration.match(/(\d+)S/);
   if (secondsMatch) seconds = parseInt(secondsMatch[1]);

   return { hours, minutes, seconds };
}

/**
 * API endpoint to get playlist duration and information
 * @route GET /api/data
 * @query {string} id - YouTube playlist ID
 * @query {number} [watched] - Number of videos already watched (optional)
 * @returns {Object} JSON response with playlist info and duration
 */
app.get("/api/data", async (req, res) => {
   const response = { duration: { days: 0, hours: 0, minutes: 0, seconds: 0 } };
   const playlistId = req.query.id;
   const watched = req.query.watched;

   // Validate request parameters
   if (!playlistId) {
      return res.status(400).json({ error: 'Playlist ID is required' });
   }
   if (watched && isNaN(watched)) {
      return res.status(400).json({ error: 'watched must be a number' });
   }

   try {
      // Get playlist metadata (title, channel, thumbnail)
      const playlistMetadataResponse = await fetch(`${YOUTUBE_PLAYLIST_METADATA}?key=${API_KEY}&part=snippet&id=${playlistId}`);
      const playlistMetadata = await playlistMetadataResponse.json();

      // if (playlistMetadata.error.code === 403) { 
      //    return res.status(403).json({ error: "Current Quota exceeded. Please try after some time" }) 
      // }

      response.playlistName = playlistMetadata.items[0].snippet.title;
      response.channelName = playlistMetadata.items[0].snippet.channelTitle;
      response.thumbnail = playlistMetadata.items[0].snippet.thumbnails.standard.url;

      // Fetch all playlist items (paginated)
      // @type {Object} 
      let playlistData = [];
      // @type {string|null}
      let nextPageToken = null;

      // Handle pagination to get all videos in the playlist
      do {
         await fetch(`${YOUTUBE_PLAYLIST_DATA}?key=${API_KEY}&part=contentDetails,snippet&playlistId=${playlistId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`)
            .then(respo => respo.json())
            .then(data => {
               if (!nextPageToken) {
                  // First page of results
                  playlistData = data;
                  response.totalVideos = playlistData.pageInfo.totalResults;
                  if (watched) response.videosLeft = playlistData.pageInfo.totalResults - watched;
               } else {
                  // Subsequent pages - append items to existing data
                  playlistData.items = [...playlistData.items, ...data.items];
                  if (playlistData.items.length === response.totalVideos) nextPageToken = null;
               }
               nextPageToken = data.nextPageToken;
            });
      } while (nextPageToken != null);

      // Fetch the duration of each video in the playlist
      /** @type {Promise<{hours: number, minutes: number, seconds: number}>[]} */
      const videoPromises = await playlistData.items.map(async (item) => {
         const videoId = item.contentDetails.videoId;
         const videoResponse = await fetch(`${YOUTUBE_VIDEO_METADATA}?key=${API_KEY}&part=contentDetails&id=${videoId}`);
         const videoData = await videoResponse.json();

         // Return parsed duration or default if video data isn't available
         if (videoData.items && videoData.items.length > 0) return parseDuration(videoData.items[0].contentDetails.duration);
         return { hours: 0, minutes: 0, seconds: 0 };
      });

      // Wait for all video duration requests to complete
      const videoDurations = await Promise.all(videoPromises);

      // Remove already watched videos from calculation if specified
      if (watched != undefined) videoDurations.splice(0, watched);

      // Calculate total duration in seconds
      let totalSeconds = 0;
      videoDurations.forEach(vid => totalSeconds += (vid.hours * 3600) + (vid.minutes * 60) + vid.seconds);

      // Convert total seconds to days, hours, minutes, seconds
      response.duration.days = Math.floor(totalSeconds / (3600 * 24));
      response.duration.hours = Math.floor(totalSeconds / 3600 % 24);
      response.duration.minutes = Math.floor((totalSeconds % 3600) / 60);
      response.duration.seconds = totalSeconds % 60;

      res.json(response);
   } catch (err) {
      console.error(`Error: ${err}`);
      res.status(500).json({ error: 'An error occurred while processing your request' });
   }
});

app.listen(PORT, () => {
   console.log(`App running on port ${PORT}`);
});
