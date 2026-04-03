const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  manageAddresses,
  toggleWishlist,
  getUsers,
  updateUserRole,
  updateUserStatus,
  adminUpdateUser,
  adminDeleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth.middleware');
const { admin } = require('../middleware/admin.middleware');

router.use(protect); // All routes below are protected

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.put('/profile/password', changePassword);
router.put('/profile/addresses', manageAddresses);
router.put('/profile/wishlist/:productId', toggleWishlist);

// Admin Routes
router.route('/')
  .get(admin, getUsers);
  
router.put('/:id/role', admin, updateUserRole);
router.route('/:id/status')
  .put(protect, admin, updateUserStatus);

router.route('/:id')
  .put(protect, admin, adminUpdateUser)
  .delete(protect, admin, adminDeleteUser);

module.exports = router;
