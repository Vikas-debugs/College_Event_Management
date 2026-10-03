const http = require('http');

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runReview() {
  console.log('====================================================');
  console.log('🔍 TIHS-CEMS FULL SYSTEM MODULE REVIEW & INTEGRITY TEST');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, extra = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${title} ${extra}`);
    } else {
      console.error(`❌ [FAIL] ${title} ${extra}`);
    }
  }

  // 1. Health check
  try {
    const health = await request('GET', '/api/health');
    assert('Backend Health Check', health.status === 200 && health.data.status === 'online', `(status: ${health.status})`);
  } catch (err) {
    assert('Backend Health Check', false, err.message);
  }

  // 2. Events check
  let events = [];
  try {
    const eventsRes = await request('GET', '/api/events?status=published');
    events = eventsRes.data.data || [];
    assert('Events Retrieval', eventsRes.status === 200 && events.length > 0, `(${events.length} published events)`);

    // Verify all published events are free
    const allFree = events.every((e) => e.fee === 0);
    assert('All Events Free Entry (fee === 0)', allFree, `(${events.filter((e) => e.fee === 0).length}/${events.length} free)`);
    
    events.forEach((ev) => {
      console.log(`   - "${ev.title}" [${ev.category}] Fee: ₹${ev.fee} | Status: ${ev.status} | Date: ${ev.startDate.slice(0, 10)}`);
    });
  } catch (err) {
    assert('Events Retrieval', false, err.message);
  }

  // 3. Auth Check - Student Login
  let studentToken = null;
  try {
    const loginRes = await request('POST', '/api/auth/login', {
      email: 'student@tihs.edu.in',
      password: 'Student@123',
    });
    studentToken = loginRes.data.accessToken;
    assert('Student Authentication', loginRes.status === 200 && !!studentToken, `(Role: ${loginRes.data?.user?.role})`);
  } catch (err) {
    assert('Student Authentication', false, err.message);
  }

  // 4. Registration Check - Register for Event
  if (studentToken && events.length > 0) {
    try {
      // Find an event the student hasn't registered for yet
      const myRegsRes = await request('GET', '/api/registrations/me', null, {
        Authorization: `Bearer ${studentToken}`,
      });
      const registeredEventIds = (myRegsRes.data.data || []).map((r) => (r.event?._id || r.event));
      const targetEvent = events.find((e) => !registeredEventIds.includes(e._id)) || events[0];

      const regRes = await request('POST', `/api/events/${targetEvent._id}/register`, {}, {
        Authorization: `Bearer ${studentToken}`,
      });

      if (regRes.status === 201) {
        assert('Event Registration (Free 1-Click + QR Pass)', true, `(Ticket: ${regRes.data?.data?.ticketCode})`);
      } else if (regRes.status === 400 && regRes.data.message?.includes('already registered')) {
        assert('Duplicate Registration Safety Guard', true, `(Prevented duplicate pass)`);
      } else {
        assert('Event Registration', false, `Status: ${regRes.status}, Message: ${regRes.data.message}`);
      }
    } catch (err) {
      assert('Event Registration', false, err.message);
    }
  }

  // 5. My Registrations Endpoint Check
  if (studentToken) {
    try {
      const myRegs = await request('GET', '/api/registrations/me', null, {
        Authorization: `Bearer ${studentToken}`,
      });
      assert('Get Student Passes & Registrations', myRegs.status === 200 && Array.isArray(myRegs.data.data), `(${myRegs.data.count} passes found)`);
    } catch (err) {
      assert('Get Student Passes & Registrations', false, err.message);
    }
  }

  // 6. Auth Check - Admin Login & Analytics
  let adminToken = null;
  try {
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@tihs.edu.in',
      password: 'Admin@123',
    });
    adminToken = adminLoginRes.data.accessToken;
    assert('Admin Authentication', adminLoginRes.status === 200 && !!adminToken, `(Role: ${adminLoginRes.data?.user?.role})`);
  } catch (err) {
    assert('Admin Authentication', false, err.message);
  }

  // 7. Admin Analytics Check
  if (adminToken) {
    try {
      const analyticsRes = await request('GET', '/api/admin/analytics', null, {
        Authorization: `Bearer ${adminToken}`,
      });
      assert('Admin Analytics KPI Dashboard', analyticsRes.status === 200 && analyticsRes.data.success, `(Total Users: ${analyticsRes.data.data?.summary?.totalUsers}, Events: ${analyticsRes.data.data?.summary?.totalEvents})`);
    } catch (err) {
      assert('Admin Analytics KPI Dashboard', false, err.message);
    }
  }

  // 8. Admin Users List Check
  if (adminToken) {
    try {
      const usersRes = await request('GET', '/api/admin/users', null, {
        Authorization: `Bearer ${adminToken}`,
      });
      assert('Admin User Management List', usersRes.status === 200 && Array.isArray(usersRes.data.data), `(${usersRes.data.count} users in DB)`);
    } catch (err) {
      assert('Admin User Management List', false, err.message);
    }
  }

  // 9. Public Certificate Verification Check
  try {
    const certRes = await request('GET', '/api/certificates/TIHS-FIN-468089-9012');
    assert('Certificate Verification By CertificateID', certRes.status === 200 && certRes.data.success, `(Verified: ${certRes.data?.data?.certificateId})`);
  } catch (err) {
    assert('Certificate Verification By CertificateID', false, err.message);
  }

  console.log('\n====================================================');
  console.log(`📊 SUMMARY: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================');
}

runReview().catch(console.error);
