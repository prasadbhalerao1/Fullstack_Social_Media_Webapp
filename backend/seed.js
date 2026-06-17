import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";
import Post from "./models/post.model.js";
import Reel from "./models/reel.model.js";
import Story from "./models/story.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const usersToSeed = [
  {
    username: "mobiletester",
    email: "mobiletester@example.com",
    password: "password123",
    bio: "Mobile app QA & UX tester. Connecting with devs globally.",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
    isVerified: true
  },
  {
    username: "react_developer",
    email: "react_dev@example.com",
    password: "password123",
    bio: "React 19 & Next.js engineer. Loving Tailwind CSS v4!",
    profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
    isVerified: true
  },
  {
    username: "creative_coder",
    email: "creative_coder@example.com",
    password: "password123",
    bio: "Exploring creative coding, WebGL, shaders, and animations.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    isVerified: false
  },
  {
    username: "fullstack_guru",
    email: "fullstack_guru@example.com",
    password: "password123",
    bio: "Node.js, GraphQL, Redis & System Design enthusiast. Code is life.",
    profileImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop",
    isVerified: true
  },
  {
    username: "pixel_magic",
    email: "pixel_magic@example.com",
    password: "password123",
    bio: "UI/UX Designer & Digital Artist. Crafting premium user experiences.",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    isVerified: false
  },
  {
    username: "antigravity_ai",
    email: "antigravity_ai@example.com",
    password: "password123",
    bio: "I build powerful agentic systems at Google DeepMind.",
    profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop",
    isVerified: true
  }
];

const mockReels = [
  {
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
    caption: "Shining bright under the neon glow ✨ Neon city vibes. #neon #vibes"
  },
  {
    mediaUrl: "https://raw.githubusercontent.com/manjees/compose-reels/main/compose-reels-sample.mp4",
    caption: "Living life in portrait mode 📱 Fresh perspectives only. #lifestyle #nature"
  },
  {
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-womans-feet-splashing-in-a-puddle-1230-large.mp4",
    caption: "Splashing around in the rain 🌧️ Finding joy in the little things. #rainyday #aesthetic"
  },
  {
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-steaming-cup-of-tea-1228-large.mp4",
    caption: "Warm tea on a cozy morning ☕ Start your day with mindfulness. #morningroutine #tea"
  },
  {
    mediaUrl: "https://assets.mixkit.co/videos/preview/mixkit-steam-rising-from-a-cup-of-hot-coffee-1223-large.mp4",
    caption: "Coffee steam rises like morning motivation ☕ Let's build! #devlife #coffee"
  }
];

const mockPosts = [
  {
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
    caption: "Sandy beaches and endless horizons 🏖️ WFH (Work From Hotel) setup today."
  },
  {
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop",
    caption: "Morning fog rising over the valley mountains. Breathtaking view 🏔️🌲"
  },
  {
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&auto=format&fit=crop",
    caption: "Deep in the enchanted forest paths. Clear your mind 🍃👣"
  },
  {
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop",
    caption: "Refactoring legacy code at 2 AM. Best feeling ever when it compiles! 💻🔥"
  },
  {
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop",
    caption: "Clean desk setup. Minimalist workspace leads to minimalist bugs 🪵☕"
  },
  {
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop",
    caption: "Exploring the grand red rocks of Antelope Canyon. Majestic patterns! 🏜️"
  },
  {
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop",
    caption: "Sunlight bursting through the pine tree fog. Nature's filter 🌲☀️"
  },
  {
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop",
    caption: "Meet my new programming assistant 🐱 He only reviews code that has bugs."
  },
  {
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1472214222541-d510753a8707?w=800&auto=format&fit=crop",
    caption: "An open field under a golden sky. Wishing you all a productive week! 🌾✨"
  },
  {
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop",
    caption: "Lakeside views in the Alps. Clear blue waters. 🛶💙 #italy #lakecomo"
  }
];

const commentsPool = [
  "Wow, this is amazing! 🔥",
  "Love the vibes here. Absolutely stunning!",
  "Can you share the location or tools used?",
  "Keep up the great work! Clean composition.",
  "Incredible! Visual perfection.",
  "Very cool! 🚀 What a clean setup.",
  "This is a masterclass in UI/UX design.",
  "Unbelievable! Thanks for sharing this.",
  "Mind-blowing. I'm definitely saving this one.",
  "Insane quality! Love the grading.",
  "This is beautiful! 🌟 Ready for production?",
  "Stunning composition. The colors are great.",
  "Oh wow, this looks fantastic!",
  "Brilliant content. Appreciate the post!",
  "Nice work. Subscribed for more of this!"
];

const seedDatabase = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI environment variable is missing.");
    }
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully!");

    // 1. Clear existing Posts, Reels, Stories
    console.log("Clearing existing Posts, Reels, and Stories...");
    await Post.deleteMany({});
    await Reel.deleteMany({});
    await Story.deleteMany({});

    // 2. Clear user posts/reels references and mock users (except mobiletester session!)
    console.log("Resetting users...");
    const existingUsers = await User.find({});
    
    // We want to keep active logged-in users, especially 'mobiletester'
    const mobileTesterUser = existingUsers.find(u => u.username === "mobiletester");
    
    // Deleting non-mobiletester users to clear old clutter and create fresh ones
    await User.deleteMany({ username: { $ne: "mobiletester" } });
    
    const seededUserDocs = [];

    // Ensure mobiletester exists
    let testerDoc;
    if (mobileTesterUser) {
      testerDoc = mobileTesterUser;
      testerDoc.posts = [];
      testerDoc.reels = [];
      testerDoc.story = [];
      testerDoc.followers = [];
      testerDoc.following = [];
      await testerDoc.save();
      console.log("Kept and reset mobiletester user ID:", testerDoc._id);
    } else {
      const seedData = usersToSeed.find(u => u.username === "mobiletester");
      const hashedPassword = await bcrypt.hash(seedData.password, 10);
      testerDoc = await User.create({
        ...seedData,
        password: hashedPassword
      });
      console.log("Created mobiletester user ID:", testerDoc._id);
    }
    seededUserDocs.push(testerDoc);

    // Create other users
    for (const seedData of usersToSeed) {
      if (seedData.username === "mobiletester") continue;
      const hashedPassword = await bcrypt.hash(seedData.password, 10);
      const user = await User.create({
        ...seedData,
        password: hashedPassword
      });
      seededUserDocs.push(user);
    }
    console.log(`Seeded ${seededUserDocs.length} users successfully!`);

    // Setup follow networks between them to populate feeds/suggestions
    console.log("Setting up follow relations...");
    for (let i = 0; i < seededUserDocs.length; i++) {
      const user = seededUserDocs[i];
      // Follow the next 3 users circularly
      const followTargets = [];
      for (let j = 1; j <= 3; j++) {
        const target = seededUserDocs[(i + j) % seededUserDocs.length];
        followTargets.push(target._id);
      }
      user.following = followTargets;
      await user.save();

      // Add as followers to those targets
      for (const targetId of followTargets) {
        const targetUser = seededUserDocs.find(u => u._id.toString() === targetId.toString());
        if (targetUser && !targetUser.followers.includes(user._id)) {
          targetUser.followers.push(user._id);
          await targetUser.save();
        }
      }
    }

    // 3. Seed exactly 20 Posts with likes and comments
    console.log("Seeding exactly 20 posts with likes and comments...");
    for (let i = 0; i < 20; i++) {
      const mockPost = mockPosts[i % mockPosts.length];
      const creator = seededUserDocs[i % seededUserDocs.length];
      
      // Select random likes from other users
      const numLikes = Math.floor(Math.random() * 4) + 1; // 1 to 4 likes
      const shuffledUsers = [...seededUserDocs].sort(() => 0.5 - Math.random());
      const likes = shuffledUsers.slice(0, numLikes).map(u => u._id);

      // Select random comments
      const numComments = Math.floor(Math.random() * 3) + 1; // 1 to 3 comments
      const comment = [];
      for (let j = 0; j < numComments; j++) {
        const commentUser = seededUserDocs[Math.floor(Math.random() * seededUserDocs.length)];
        const text = commentsPool[Math.floor(Math.random() * commentsPool.length)];
        comment.push({
          user: commentUser._id,
          text,
          createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        });
      }

      const post = await Post.create({
        user: creator._id,
        mediaType: mockPost.mediaType,
        mediaUrl: mockPost.mediaUrl,
        caption: `${mockPost.caption} (Post #${i + 1})`,
        likes,
        comment
      });

      // Link back to user
      creator.posts.push(post._id);
      await creator.save();
    }
    console.log("Successfully seeded 20 posts!");

    // 4. Seed exactly 20 Reels with likes and comments
    console.log("Seeding exactly 20 reels with likes and comments...");
    for (let i = 0; i < 20; i++) {
      const mockReel = mockReels[i % mockReels.length];
      const creator = seededUserDocs[(i + 2) % seededUserDocs.length];
      
      // Select random likes from other users
      const numLikes = Math.floor(Math.random() * 4) + 1; // 1 to 4 likes
      const shuffledUsers = [...seededUserDocs].sort(() => 0.5 - Math.random());
      const likes = shuffledUsers.slice(0, numLikes).map(u => u._id);

      // Select random comments
      const numComments = Math.floor(Math.random() * 3) + 1; // 1 to 3 comments
      const comment = [];
      for (let j = 0; j < numComments; j++) {
        const commentUser = seededUserDocs[Math.floor(Math.random() * seededUserDocs.length)];
        const text = commentsPool[Math.floor(Math.random() * commentsPool.length)];
        comment.push({
          user: commentUser._id,
          text,
          createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        });
      }

      const reel = await Reel.create({
        user: creator._id,
        mediaUrl: mockReel.mediaUrl,
        caption: `${mockReel.caption} (Reel #${i + 1})`,
        likes,
        comment
      });

      // Link back to user
      creator.reels.push(reel._id);
      await creator.save();
    }
    console.log("Successfully seeded 20 reels!");

    // 5. Seed active Stories for all users
    console.log("Seeding active stories for all users with viewers, likes, and comments...");
    const storyMedia = [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&fit=crop",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&fit=crop",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&fit=crop",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&fit=crop"
    ];

    for (let i = 0; i < seededUserDocs.length; i++) {
      const creator = seededUserDocs[i];
      
      // Select random viewers
      const numViewers = Math.floor(Math.random() * 3) + 1; // 1 to 3 viewers
      const shuffledViewers = [...seededUserDocs].filter(u => u._id.toString() !== creator._id.toString()).sort(() => 0.5 - Math.random());
      const viewers = shuffledViewers.slice(0, numViewers).map(u => u._id);

      // Select random likes
      const numLikes = Math.floor(Math.random() * 2) + 1; // 1 to 2 likes
      const likes = shuffledViewers.slice(0, numLikes).map(u => u._id);

      // Select random comments
      const numComments = Math.floor(Math.random() * 2) + 1; // 1 to 2 comments
      const comment = [];
      for (let j = 0; j < numComments; j++) {
        const commentUser = seededUserDocs[Math.floor(Math.random() * seededUserDocs.length)];
        const text = commentsPool[Math.floor(Math.random() * commentsPool.length)];
        comment.push({
          user: commentUser._id,
          text,
          createdAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000)
        });
      }

      const story = await Story.create({
        user: creator._id,
        mediaType: "image",
        mediaUrl: storyMedia[i % storyMedia.length],
        caption: `Quick update from ${creator.username}! 🌟`,
        viewers,
        likes,
        comment,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      });

      creator.story.push(story._id);
      await creator.save();
    }
    console.log("Successfully seeded active stories for all users!");

    console.log("Seeding complete! Closing connection.");
    await mongoose.connection.close();
    console.log("Connection closed.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
