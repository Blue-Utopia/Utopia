import { Router } from 'express';
import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';
import { prisma } from '../context';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate nonce for wallet authentication
router.post('/nonce', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const nonce = `Sign this message to authenticate with Freelance Marketplace\n\nNonce: ${Math.random().toString(36).substring(7)}\nTimestamp: ${Date.now()}`;

    return res.json({ nonce });
  } catch (error) {
    console.error('Nonce generation error:', error);
    return res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

// Verify signature and return JWT
router.post('/verify', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature
    const recoveredAddress = verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          lastActiveAt: new Date(),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        walletAddress: user.walletAddress,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;

