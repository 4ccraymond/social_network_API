import { Request, Response } from 'express';
import Thought from '../models/Thought';
import User from '../models/User';

const thoughtController = {
  // Get all thoughts
  async getAllThoughts(req: Request, res: Response) {
    try {
      const thoughts = await Thought.find();
      res.json(thoughts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get thoughts', details: err });
    }
  },

  // Get a single thought by ID
  async getThoughtById(req: Request, res: Response) {
    try {
      const thought = await Thought.findById(req.params.id);

      if (!thought) return res.status(404).json({ message: 'Thought not found' });

      res.json(thought);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get thought', details: err });
    }
  },

  // Create a new thought and push its ID to the user's thoughts array
  async createThought(req: Request, res: Response) {
    try {
      const newThought = await Thought.create(req.body);

      // Push the thought to the user's thoughts array
      await User.findByIdAndUpdate(
        req.body.userId,
        { $push: { thoughts: newThought._id } },
        { new: true }
      );

      res.status(201).json(newThought);
    } catch (err) {
      res.status(400).json({ error: 'Failed to create thought', details: err });
    }
  },

  // Update a thought
  async updateThought(req: Request, res: Response) {
    try {
      const updatedThought = await Thought.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedThought) return res.status(404).json({ message: 'Thought not found' });

      res.json(updatedThought);
    } catch (err) {
      res.status(400).json({ error: 'Failed to update thought', details: err });
    }
  },

  // Delete a thought
  async deleteThought(req: Request, res: Response) {
    try {
      const deletedThought = await Thought.findByIdAndDelete(req.params.id);

      if (!deletedThought) return res.status(404).json({ message: 'Thought not found' });

      // Also remove the thought from the user's thoughts array
      await User.findOneAndUpdate(
        { thoughts: req.params.id },
        { $pull: { thoughts: req.params.id } }
      );

      res.json({ message: 'Thought deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete thought', details: err });
    }
  },

  // Add a reaction
  async addReaction(req: Request, res: Response) {
    try {
      const updatedThought = await Thought.findByIdAndUpdate(
        req.params.thoughtId,
        { $addToSet: { reactions: req.body } },
        { new: true, runValidators: true }
      );

      if (!updatedThought) return res.status(404).json({ message: 'Thought not found' });

      res.json(updatedThought);
    } catch (err) {
      res.status(400).json({ error: 'Failed to add reaction', details: err });
    }
  },

  // Remove a reaction
  async removeReaction(req: Request, res: Response) {
    try {
      const updatedThought = await Thought.findByIdAndUpdate(
        req.params.thoughtId,
        {
          $pull: { reactions: { reactionId: req.params.reactionId } },
        },
        { new: true }
      );

      if (!updatedThought) return res.status(404).json({ message: 'Thought not found' });

      res.json(updatedThought);
    } catch (err) {
      res.status(400).json({ error: 'Failed to remove reaction', details: err });
    }
  },
};

export default thoughtController;
