const Event = require('../models/Event');
const Registration = require('../models/Registration');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const emailService = require('../services/emailService');

const generateSlug = (title) => {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Math.floor(1000 + Math.random() * 9000)
  );
};

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    const { category, department, status, search, fromDate, toDate, feeType, isFeatured } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    } else {
      query.status = { $in: ['published', 'completed'] };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (department && department !== 'All') {
      query.department = { $in: [department, 'All'] };
    }

    if (feeType === 'free') {
      query.fee = 0;
    } else if (feeType === 'paid') {
      query.fee = { $gt: 0 };
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (fromDate || toDate) {
      query.startDate = {};
      if (fromDate) query.startDate.$gte = new Date(fromDate);
      if (toDate) query.startDate.$lte = new Date(toDate);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name email role department')
      .populate('approvedBy', 'name email')
      .sort({ startDate: 1 });

    // Attach registration count for each event
    const eventsWithStats = await Promise.all(
      events.map(async (ev) => {
        const regCount = await Registration.countDocuments({
          event: ev._id,
          status: { $in: ['registered', 'attended'] },
        });
        const eventObj = ev.toObject();
        eventObj.registeredCount = regCount;
        eventObj.remainingSeats = Math.max(0, ev.capacity - regCount);
        return eventObj;
      })
    );

    res.status(200).json({
      success: true,
      count: eventsWithStats.length,
      data: eventsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID or slug
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let event;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(id)
        .populate('createdBy', 'name email role department')
        .populate('approvedBy', 'name email');
    } else {
      event = await Event.findOne({ slug: id })
        .populate('createdBy', 'name email role department')
        .populate('approvedBy', 'name email');
    }

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const regCount = await Registration.countDocuments({
      event: event._id,
      status: { $in: ['registered', 'attended'] },
    });

    const eventData = event.toObject();
    eventData.registeredCount = regCount;
    eventData.remainingSeats = Math.max(0, event.capacity - regCount);

    res.status(200).json({
      success: true,
      data: eventData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Faculty / Admin
exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      department,
      startDate,
      endDate,
      venue,
      capacity,
      fee,
      banner,
      tags,
      rules,
      prizes,
      customFields,
      isFeatured,
    } = req.body;

    const slug = generateSlug(title);

    // If Admin creates it, auto-approve; if Faculty creates it, status starts as 'pending'
    const status = req.user.role === 'admin' ? 'published' : 'pending';

    const event = await Event.create({
      title,
      slug,
      description,
      category,
      department: department || 'All',
      startDate,
      endDate,
      venue,
      capacity: capacity || 100,
      fee: fee || 0,
      banner: req.file ? `/uploads/${req.file.filename}` : banner || '/assets/images/campus-hero.webp',
      tags: typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags || [],
      rules,
      prizes,
      status,
      customFields: customFields ? (typeof customFields === 'string' ? JSON.parse(customFields) : customFields) : [],
      isFeatured: isFeatured === 'true' || isFeatured === true,
      createdBy: req.user._id,
      approvedBy: req.user.role === 'admin' ? req.user._id : undefined,
    });

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'EVENT_CREATED',
      details: `Created event "${event.title}" with status ${status}`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(201).json({
      success: true,
      message:
        req.user.role === 'admin'
          ? 'Event published successfully!'
          : 'Event proposal submitted for Administrator approval!',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Faculty / Admin
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check ownership unless admin
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.banner = `/uploads/${req.file.filename}`;
    }
    if (typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t) => t.trim());
    }
    if (typeof updates.customFields === 'string') {
      updates.customFields = JSON.parse(updates.customFields);
    }

    event = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'EVENT_UPDATED',
      details: `Updated event "${event.title}"`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Faculty (own) / Admin
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'EVENT_DELETED',
      details: `Deleted event "${event.title}"`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: 'Event successfully removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve event proposal
// @route   PATCH /api/events/:id/approve
// @access  Admin
exports.approveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.status = 'published';
    event.approvedBy = req.user._id;
    event.rejectionReason = undefined;
    await event.save();

    // Send email to faculty proposer
    if (event.createdBy && event.createdBy.email) {
      await emailService.sendEventApproved(event.createdBy, event);
      await Notification.create({
        user: event.createdBy._id,
        title: 'Event Proposal Approved!',
        message: `Your event proposal "${event.title}" has been approved and published to the TIHS portal.`,
        type: 'approval',
        link: `/events/${event.slug || event._id}`,
      });
    }

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'EVENT_APPROVED',
      details: `Approved event "${event.title}"`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Event "${event.title}" is now approved and published!`,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject event proposal
// @route   PATCH /api/events/:id/reject
// @access  Admin
exports.rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.status = 'draft';
    event.rejectionReason = reason || 'Proposal requirements not met.';
    await event.save();

    if (event.createdBy && event.createdBy.email) {
      await emailService.sendEventRejected(event.createdBy, event, reason);
      await Notification.create({
        user: event.createdBy._id,
        title: 'Event Proposal Revision Needed',
        message: `Your event proposal "${event.title}" was not approved. Reason: ${reason || 'See review notes'}`,
        type: 'approval',
        link: `/events/${event._id}/edit`,
      });
    }

    await AuditLog.create({
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'EVENT_REJECTED',
      details: `Rejected event "${event.title}". Reason: ${reason}`,
      ip: req.ip || '127.0.0.1',
    });

    res.status(200).json({
      success: true,
      message: `Event proposal rejected with feedback sent to faculty coordinator.`,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk CSV Import Events
// @route   POST /api/events/bulk-import
// @access  Admin
exports.bulkImportEvents = async (req, res, next) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid CSV event payload' });
    }

    const createdList = [];
    for (const item of events) {
      const slug = generateSlug(item.title || 'TIHS Event');
      const doc = await Event.create({
        title: item.title,
        slug,
        description: item.description || 'TIHS College Event',
        category: item.category || 'Workshop',
        department: item.department || 'All',
        startDate: item.startDate || new Date(Date.now() + 86400000),
        endDate: item.endDate || new Date(Date.now() + 86400000 * 2),
        venue: item.venue || 'TIHS Main Auditorium',
        capacity: Number(item.capacity) || 100,
        fee: Number(item.fee) || 0,
        status: 'published',
        createdBy: req.user._id,
        approvedBy: req.user._id,
      });
      createdList.push(doc);
    }

    res.status(201).json({
      success: true,
      message: `Successfully imported ${createdList.length} events!`,
      data: createdList,
    });
  } catch (error) {
    next(error);
  }
};
