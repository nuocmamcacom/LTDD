const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Start new session - force logout other sessions
router.post('/session/start', async (req, res) => {
  try {
    const { email, deviceInfo } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate unique session ID
    const sessionId = `${email}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const deviceDescription = deviceInfo || 'Unknown Device';
    
    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
    }

    // Check if user already has an active session
    if (user.activeSession && user.activeSession.sessionId) {
      console.log(`🚨 User ${email} already has active session. Forcing logout of previous session.`);
    }

    // Set new active session (overwrites any existing session)
    user.activeSession = {
      sessionId,
      deviceInfo: deviceDescription,
      loginTime: new Date(),
      lastActivity: new Date()
    };

    await user.save();

    console.log(`🔐 New session started for ${email}: ${sessionId}`);

    res.json({
      success: true,
      sessionId,
      message: user.activeSession.sessionId !== sessionId ? 'Previous session terminated' : 'Session started'
    });

  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Validate session - check if current session is still active
router.post('/session/validate', async (req, res) => {
  try {
    const { email, sessionId } = req.body;
    
    if (!email || !sessionId) {
      return res.status(400).json({ error: 'Email and sessionId are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.activeSession) {
      return res.json({ valid: false, reason: 'No active session' });
    }

    // Check if this is the current active session
    if (user.activeSession.sessionId !== sessionId) {
      console.log(`🚨 Session conflict for ${email}. Expected: ${user.activeSession.sessionId}, Got: ${sessionId}`);
      return res.json({ 
        valid: false, 
        reason: 'Session invalidated by another login',
        activeSession: {
          deviceInfo: user.activeSession.deviceInfo,
          loginTime: user.activeSession.loginTime
        }
      });
    }

    // Update last activity
    user.activeSession.lastActivity = new Date();
    await user.save();

    res.json({ valid: true, sessionId });

  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ error: 'Failed to validate session' });
  }
});

// End session
router.post('/session/end', async (req, res) => {
  try {
    const { email, sessionId } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (user && user.activeSession && user.activeSession.sessionId === sessionId) {
      user.activeSession = undefined;
      await user.save();
      console.log(`🔐 Session ended for ${email}`);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Get active sessions info (for debugging)
router.get('/session/info/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      email,
      activeSession: user.activeSession || null
    });

  } catch (error) {
    console.error('Session info error:', error);
    res.status(500).json({ error: 'Failed to get session info' });
  }
});

module.exports = router;