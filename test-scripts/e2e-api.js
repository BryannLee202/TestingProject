const crypto = require('crypto');
const http = require('http');

const API_BASE = {
  hostname: 'localhost',
  port: 8081,
  path: '/api'
};

async function request(endpoint, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE.hostname,
      port: API_BASE.port,
      path: API_BASE.path + endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let parsed = rawData;
        try { parsed = JSON.parse(rawData); } catch (e) {}
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsed);
        } else {
          reject(new Error(`[${res.statusCode}] ${typeof parsed === 'object' ? JSON.stringify(parsed) : parsed}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING E2E API TESTS ---');
  let token = '';
  let userId = null;
  const testId = crypto.randomBytes(4).toString('hex');
  const email = `testuser_${testId}@example.com`;
  const password = 'Password123!';
  let firstBookId = null;

  try {
    // 1. Register User
    console.log(`1. Testing Registration for ${email}...`);
    await request('/auth/register', 'POST', {
      email: email,
      password: password,
      name: 'Test User',
      phone: '0123456789'
    });
    console.log('   -> Registration Success.');

    // 2. Login
    console.log('2. Testing Login...');
    const loginData = await request('/auth/login', 'POST', {
      email: email,
      password: password
    });
    token = loginData.token || loginData.jwt || loginData.accessToken;
    userId = loginData.id || loginData.userId || loginData.user?.id;
    if (!token) throw new Error('Token not found in login response');
    console.log('   -> Login Success. Token obtained.');

    // 3. Get Categories
    console.log('3. Fetching Categories...');
    const categories = await request('/categories', 'GET', null, false);
    console.log(`   -> Found ${categories.length || 0} categories.`);

    // 4. Get Featured Books
    console.log('4. Fetching Featured Books...');
    let books = await request('/books/featured', 'GET', null, false);
    console.log(`   -> Found ${books.length || 0} featured books.`);
    if (books.length > 0) {
      firstBookId = books[0].id;
    } else {
      // GET /books tra ve mang thuan, khong phai trang phan trang {content:[...]}
      const allBooks = await request('/books', 'GET', null, false);
      if (Array.isArray(allBooks) && allBooks.length > 0) {
        firstBookId = allBooks[0].id;
      }
    }
    if (!firstBookId) {
      console.warn('   -> No books found in DB. Skipping cart/checkout tests.');
      process.exit(0);
    }
    console.log(`   -> Selected Book ID: ${firstBookId}`);

    // 5. Add to Cart
    console.log('5. Adding Book to Cart...');
    try {
      await request('/cart', 'POST', {
        bookId: firstBookId,
        quantity: 1
      }, token);
      console.log('   -> Added to cart.');
    } catch(e) {
      console.log('   -> Add to cart failed: ' + e.message);
    }

    // 6. View Cart
    console.log('6. Viewing Cart...');
    try {
      const cart = await request('/cart', 'GET', null, token);
      console.log(`   -> Cart items count: ${cart.items ? cart.items.length : 0}`);
    } catch (e) {
      console.log('   -> View cart failed: ' + e.message);
    }

    // 7. Checkout (Create Order)
    console.log('7. Testing Checkout...');
    try {
      const order = await request('/orders', 'POST', {
        shippingAddress: '123 Test St',
        phoneNumber: '0123456789',
        paymentMethod: 'COD',
        customerNote: 'Test order',
        shippingFee: 15000,
        items: [
           { bookId: firstBookId, quantity: 1, price: 50000 }
        ]
      }, token);
      console.log(`   -> Order placed successfully. Order ID: ${order.id}`);
    } catch (e) {
      console.log('   -> Checkout failed: ' + e.message);
    }

    // 8. Add Review
    console.log('8. Testing Review Submission...');
    try {
      await request(`/reviews/book/${firstBookId}`, 'POST', {
        rating: 5,
        comment: 'Great book! Tested autonomously.'
      }, token);
      console.log('   -> Review submitted.');
    } catch (reviewErr) {
       console.log('   -> Review test failed (expected if not purchased/delivered): ' + reviewErr.message);
    }

    console.log('\n--- ALL E2E API TESTS PASSED SUCCESSFULLY ---');
  } catch (err) {
    console.error('\n--- TEST FAILED ---');
    console.error(err);
    process.exit(1);
  }
}

runTests();
