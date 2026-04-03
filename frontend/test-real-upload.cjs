const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function downloadImage(url, path) {
  const writer = fs.createWriteStream(path);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function testUpload() {
  const imagePath = 'real-test-image.jpg';
  try {
    console.log('1. Downloading real image...');
    await downloadImage('https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800', imagePath);
    console.log('Image downloaded successfully.');

    console.log('2. Fetching category...');
    const catRes = await axios.get('http://localhost:5000/api/categories');
    const categoryId = catRes.data.data[0]._id;

    console.log('3. Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@melora.com',
      password: 'password123'
    });
    const token = loginRes.data.accessToken;

    console.log('4. Preparing FormData...');
    const data = new FormData();
    data.append('name', JSON.stringify({ en: 'Test API English Name', ar: '', tr: '' }));
    data.append('description', JSON.stringify({ en: 'Test description', ar: '', tr: '' }));
    data.append('price', 1500);
    // simulated sku/slug since front-end does it usually
    data.append('sku', 'TESTSKU-' + Math.floor(Math.random() * 1000));
    data.append('slug', 'test-api-english-name');
    data.append('category', categoryId);
    
    data.append('seo', JSON.stringify({ metaTitle: '', metaDescription: '', slug: 'test-api-english-name' }));

    data.append('images', fs.createReadStream(imagePath));

    console.log('5. Uploading product to API...');
    const prodRes = await axios.post('http://localhost:5000/api/products', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...data.getHeaders()
      }
    });

    console.log('✅ Product created successfully!');
    console.log('Response ID:', prodRes.data.data._id);
    console.log('Images in DB:', prodRes.data.data.images);
    
  } catch (err) {
    if (err.response) {
      console.error('API Error:', JSON.stringify(err.response.data, null, 2));
      console.error('Stack:', err.response.data.stack);
    } else {
      console.error('Error:', err.message);
    }
  } finally {
     if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }
}
testUpload();
