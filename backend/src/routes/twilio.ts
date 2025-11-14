import { Router } from 'express';
import twilio from 'twilio';
import { prisma } from '../context';
import { authenticateWallet, AuthRequest } from '../middleware/auth';

const router = Router();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

// Store verification codes temporarily (in production, use Redis)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// Send verification code
router.post('/send-code', authenticateWallet, async (req: AuthRequest, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    if (!twilioClient) {
      // Development mode: return mock code
      console.log('Twilio not configured, using mock verification');
      const code = '123456';
      verificationCodes.set(phoneNumber, {
        code,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
      
      return res.json({
        success: true,
        message: 'Verification code sent (DEV MODE)',
        devCode: code, // Only in development!
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code with expiration
    verificationCodes.set(phoneNumber, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send SMS
    await twilioClient.messages.create({
      body: `Your verification code is: ${code}`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    return res.json({
      success: true,
      message: 'Verification code sent',
    });
  } catch (error) {
    console.error('SMS send error:', error);
    return res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify code
router.post('/verify-code', authenticateWallet, async (req: AuthRequest, res) => {
  try {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and code required' });
    }

    const storedData = verificationCodes.get(phoneNumber);

    if (!storedData) {
      return res.status(400).json({ error: 'No verification code found' });
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(phoneNumber);
      return res.status(400).json({ error: 'Verification code expired' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Code is valid, update user
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        phoneNumber,
        phoneVerified: true,
      },
    });

    // Remove used code
    verificationCodes.delete(phoneNumber);

    return res.json({
      success: true,
      message: 'Phone number verified',
    });
  } catch (error) {
    console.error('Code verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;

