import express from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import AddressController from '../controllers/addresses.js';
const router = express.Router();

// ==================for controllers folder================

router.post("/create",requireAuth, AddressController.createAddress);
router.post("/get-addresses",requireAuth, AddressController.getAddresses);
router.post("/update",requireAuth, AddressController.updateAddressById);
router.post("/delete",requireAuth, AddressController.deleteAddress);

export default router;
