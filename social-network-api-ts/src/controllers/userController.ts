import { Request, Response } from 'express';
import User from '../models/User';
import Thought from '../models/Thought';

const userController = {
  // Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.find().populate('thoughts').populate('friends');
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get users', details: err });
    }
  },

  // Get a single user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const user = await User.findById(req.params.id)
        .populate('thoughts')
        .populate('friends');

      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get user', details: err });
    }
  },

  // Create a new user
  async createUser(req: Request, res: Response) {
    try {
      const newUser = await User.create(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ error: 'Failed to create user', details: err });
    }
  },

  // Update user by ID
  async updateUser(req: Request, res: Response) {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) return res.status(404).json({ message: 'User not found' });

      res.json(updatedUser);
    } catch (err) {
      res.status(400).json({ error: 'Failed to update user', details: err });
    }
  },

  // Delete user by ID (+ BONUS: delete related thoughts)
  async deleteUser(req: Request, res: Response) {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);

      if (!deletedUser) return res.status(404).json({ message: 'User not found' });

      // Bonus: Delete user's thoughts
      await Thought.deleteMany({ _id: { $in: deletedUser.thoughts } });

      res.json({ message: 'User and associated thoughts deleted!' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete user', details: err });
    }
  },

  // Add a friend
  async addFriend(req: Request, res: Response) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { $addToSet: { friends: req.params.friendId } },
        { new: true }
      );

      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json(user);
    } catch (err) {
      res.status(400).json({ error: 'Failed to add friend', details: err });
    }
  },

  // Remove a friend
  async removeFriend(req: Request, res: Response) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { $pull: { friends: req.params.friendId } },
        { new: true }
      );

      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json(user);
    } catch (err) {
      res.status(400).json({ error: 'Failed to remove friend', details: err });
    }
  },
};

export default userController;
