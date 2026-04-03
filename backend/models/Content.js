const mongoose = require('mongoose');

// Utility to enforce standard translations for rich text blocks
const localizedString = {
  en: { type: String, default: '' },
  ar: { type: String, default: '' },
  tr: { type: String, default: '' }
};

const contentSchema = new mongoose.Schema({
  // Section 1: Hero Banner Config
  heroBanner: {
    title: { ...localizedString },
    subtitle: { ...localizedString },
    buttonText: { ...localizedString },
    backgroundImage: { type: String, default: '' } // Cloudinary URL
  },
  
  // Section 2: About Us Copy
  aboutUs: { ...localizedString },

  // Section 3: Contact & Store Metadata
  contactInfo: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    address: { ...localizedString }
  },

  // Section 4: Homepage Sections
  homeSections: {
    newArrivals: { ...localizedString },
    featured: { ...localizedString }
  },

  // Section 5: Product Page
  productPage: {
    authenticText: { ...localizedString },
    authenticDesc: { ...localizedString },
    shippingText: { ...localizedString },
    shippingDesc: { ...localizedString },
    featuresText: { ...localizedString },
    featuresDesc: { ...localizedString },
    deliveryText: { ...localizedString },
    deliveryDesc: { ...localizedString }
  },

  // Section 6: Footer
  footerText: { ...localizedString },

  // Section 7: Announcement Bar
  announcementBar: {
    text: { ...localizedString },
    enabled: { type: Boolean, default: false }
  }

}, { timestamps: true });

// Ensure it's treated as a singleton document
contentSchema.pre('save', async function() {
  if (this.isNew) {
    const count = await mongoose.model('Content').countDocuments();
    if (count > 0) {
      throw new Error('Only one Content document can exist.');
    }
  }
});

module.exports = mongoose.model('Content', contentSchema);
