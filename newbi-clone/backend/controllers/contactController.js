import ContactMessage from '../models/ContactMessage.js';

// @desc    Submit new contact inquiry
// @route   POST /api/contact
export const submitContact = async (req, res) => {
  try {
    const { audience, name, email, phone, organization, budget, timeline, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const newMessage = await ContactMessage.create({
      audience: audience || 'brand',
      name,
      email,
      phone: phone || '',
      organization: organization || '',
      budget: budget || 'Not specified',
      timeline: timeline || 'Not specified',
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry received! The Newbi crew will review your brief and reply within 24 hours.',
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error submitting contact form' });
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching contact messages' });
  }
};

// @desc    Update contact message status (Admin)
// @route   PUT /api/contact/:id
export const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!msg) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating message status' });
  }
};
