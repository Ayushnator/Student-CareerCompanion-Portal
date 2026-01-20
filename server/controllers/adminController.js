import User from '../models/User.js';

// Get all users with pending guide requests
export const getPendingRequests = async (req, res) => {
  try {
    const users = await User.find({ guideRequestStatus: 'pending' }).select('-passwordHash');
    console.log(`[Admin] Found ${users.length} pending requests.`);
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

// Approve a guide request (Grant Access)
export const approveRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body; // 'guide' or 'admin'

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Default to 'guide' if no role provided, but allow 'admin'
    const newRole = role === 'admin' ? 'admin' : 'guide';

    user.role = newRole;
    user.guideRequestStatus = 'approved';
    await user.save();

    res.status(200).json({ status: 'success', message: `User approved as ${newRole}`, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};

// Reject a guide request
export const rejectRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.guideRequestStatus = 'rejected';
    await user.save();

    res.status(200).json({ status: 'success', message: 'Guide request rejected', data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server Error' });
  }
};
