const readline = require('readline');
const fetch = require('node-fetch');

const API_KEY = '****';


async function searchVideos(terms) {
    // URL-encode the search terms to handle special characters properly
    const encodedTerms = encodeURIComponent(terms);
    // Construct the API call URL
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedTerms}&type=video&key=${API_KEY}&maxResults=10`;
  
    try {
      // Make the API call
      const response = await fetch(url);
      const data = await response.json();
  
      // Check if any videos were found
      if (data.items.length === 0) {
        console.log('No videos found.');
        return;
      }
  
      // Display the top 10 videos
      console.log('Top 10 videos:');
      data.items.forEach(item => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const description = item.snippet.description;
        const thumbnail = item.snippet.thumbnails.default.url;
        console.log(`Title: ${title}`);
        console.log(`Description: ${description}`);
        console.log(`Thumbnail: ${thumbnail}`);
        console.log(`Video ID: ${videoId}`);
        console.log('-----------------------------');
      });
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  }




// Function to extract the video ID from a YouTube URL
async function extractVideoId(url) {
  const videoIdMatch = url.match(/(?:v=|\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  return videoIdMatch ? videoIdMatch[1] : null;
}

// Function to fetch video details from the YouTube API using the video ID
async function fetchVideoDetails(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch video details.');
  }
  return await response.json();
}

// Function to fetch top 10 comments from the YouTube API using the video ID
async function fetchTopComments(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}&maxResults=10`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch top comments.');
  }
  const data = await response.json();
  data.items.forEach(item => {
    console.log('Comment:', item.snippet.topLevelComment.snippet.textDisplay);
  });
}

// Function to display video details in the console
function displayVideoDetails(videoData) {
  if (!videoData.items || videoData.items.length === 0) {
    console.log('Video not found.');
    return;
  }
  const { title, description, channelTitle, publishedAt } = videoData.items[0].snippet;
  const { viewCount, likeCount, commentCount } = videoData.items[0].statistics;
  console.log('Title:', title);
  console.log('Description:', description);
  console.log('Channel:', channelTitle);
  console.log('Published At:', publishedAt);
  console.log('View Count:', viewCount);
  console.log('Like Count:', likeCount);
  console.log('Comment Count:', commentCount);
}

// Main function to display a menu and handle user input
async function main() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    while (true) {
      console.log('1. Youtube Video Details');
      console.log('2. Get Top 10 Comments');
      console.log('3. Search YouTube Videos');
      console.log('4. Exit');
      const choice = await new Promise(resolve => rl.question('Choose an option: ', resolve));
  
      if (choice === '1') {
        const url = await new Promise(resolve => rl.question('Enter a YouTube video URL: ', resolve));
        const videoId = await extractVideoId(url);
        if (!videoId) {
          console.log('Invalid YouTube URL.');
          continue;
        }
        try {
          const videoData = await fetchVideoDetails(videoId);
          displayVideoDetails(videoData);
        } catch (error) {
          console.log('An error occurred:', error.message);
        }
      } else if (choice === '2') {
        const url = await new Promise(resolve => rl.question('Enter a YouTube video URL: ', resolve));
        const videoId = await extractVideoId(url);
        if (!videoId) {
          console.log('Invalid YouTube URL.');
          continue;
        }
        try {
          await fetchTopComments(videoId);
        } catch (error) {
          console.log('An error occurred:', error.message);
        }
      } else if (choice === '3') {
        const terms = await new Promise(resolve => rl.question('Enter search terms: ', resolve));
        await searchVideos(terms);
      } else if (choice === '4') {
        rl.close();
        break;
      } else {
        console.log('Invalid choice. Please try again.');
      }
    }
  }

main();