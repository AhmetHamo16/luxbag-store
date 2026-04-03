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
      password: 'password123'
    });
    
    const token = loginRes.data.accessToken;
    console.log('Logged in! Token:', token ? 'yes' : 'no');

    const data = new FormData();
    data.append('name', JSON.stringify({ en: 'Test API English Name', ar: '', tr: '' }));
    data.append('description', JSON.stringify({ en: 'Test description', ar: '', tr: '' }));
    data.append('price', 1500);
    // simulated sku/slug since front-end does it usually
    data.append('sku', 'TESTSKU-' + Math.floor(Math.random() * 1000));
    data.append('slug', 'test-api-english-name');
    data.append('category', categoryId);
    
    data.append('seo', JSON.stringify({ metaTitle: '', metaDescription: '', slug: 'test-api-english-name' }));

    fs.writeFileSync('dummy.png', 'fake image content');
    data.append('images', fs.createReadStream('dummy.png'));

    console.log('Sending product creation request...');
    const prodRes = await axios.post('http://localhost:5000/api/products', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...data.getHeaders()
      }
    });

    console.log('✅ Product created successfully!');
    console.log('Response ID:', prodRes.data.data._id);
    fs.unlinkSync('dummy.png');

  } catch (err) {
    if (err.response) {
      console.error('API Error:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
    if (fs.existsSync('dummy.png')) fs.unlinkSync('dummy.png');
  }
}
testUpload();
