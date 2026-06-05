import express from "express";
import Post from "../models/post.model.js";

export const createPost = async (req, res) => {
    try{
        const { caption, mediaType } = req.body;
        const userId = req.user._id;

        if (!req.file || !req.file.path) {
            return res.status(400).json({ success: false, message: "No media file uploaded" });
        }

        const mediaUrl = req.file.path;
        const post = await Post.create({
            user: userId,
            mediaType,
            mediaUrl,
            caption,
        })

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post
        });

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating post : " + error.message,
        });
    }
}