import { Router } from 'express';
import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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
      // For wallet auth, default to DEVELOPER role (users can create separate email account for CLIENT)
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          role: 'DEVELOPER',
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

// Signup with email and password
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username, displayName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Validate role - must be provided and must be CLIENT or DEVELOPER
    if (!role) {
      return res.status(400).json({ error: 'Role is required. Must be CLIENT or DEVELOPER' });
    }
    if (!['CLIENT', 'DEVELOPER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be CLIENT or DEVELOPER' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          ...(username ? [{ username }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      if (username && existingUser.username === username) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role (role is required)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        username: username || null,
        displayName: displayName || null,
        role: role,
        lastActiveAt: new Date(),
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message || 'Signup failed' });
  }
});

// Signin with email and password
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user has a password (email/password user)
    if (!user.password) {
      return res.status(401).json({ error: 'Please sign in with your wallet or reset your password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: error.message || 'Signin failed' });
  }
});

export default router;

