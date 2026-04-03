const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    const catRes = await axios.get('http://localhost:5000/api/categories');
    const categoryId = catRes.data.data[0]._id;
    console.log('Category ID:', categoryId);

    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@melora.com',
      password: 'Admin@1234'
    });
    const token = loginRes.data.accessToken;
    console.log('Logged in successfully!');

    // EXACT form emulation from React 
    const data = new FormData();
    const mockEnglishName = 'Luxor Elegant Tote Bag';
    const mockSlug = 'luxor-elegant-tote-bag';

    data.append('name[en]', mockEnglishName);
    data.append('description[en]', 'A very stylish, spacious tote bag crafted with the finest luxury materials.');
    data.append('price', '2999');
    data.append('category', categoryId);

    // Simulated auto-genes:
    data.append('sku', 'SKU-' + Math.floor(Math.random() * 1000));
    data.append('slug', mockSlug);
    data.append('isActive', 'true');
    data.append('isFeatured', 'false');
    data.append('seo', JSON.stringify({ metaTitle: '', metaDescription: '', slug: mockSlug }));
    data.append('specs', JSON.stringify({ brand: 'Melora' }));
    data.append('badges', JSON.stringify([]));
    data.append('availableColors', JSON.stringify([]));
    data.append('availableSizes', JSON.stringify([]));
    data.append('variants', JSON.stringify([]));

    console.log('Sending AddProduct test pipeline request...');
    const prodRes = await axios.post('http://localhost:5000/api/products', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...data.getHeaders()
      }
    });

    console.log('✅ Pipeline Test PASSED! Product created successfully with ID:', prodRes.data.data._id);
    console.log('Resulting Object in DB:', prodRes.data.data.name, prodRes.data.data.description);
    
  } catch (err) {
    if (err.response) {
      console.error('API Error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
}
testUpload();
