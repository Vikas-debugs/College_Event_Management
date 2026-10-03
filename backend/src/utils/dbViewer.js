const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '..', '..', 'data', 'store.json');

if (!fs.existsSync(storePath)) {
  console.log('❌ Database file not found at:', storePath);
  process.exit(1);
}

try {
  const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));

  console.log('\n===============================================================');
  console.log('🏛️  TIHS CEMS — DATABASE COLLECTIONS OVERVIEW');
  console.log('📍 Techno Institute of Higher Studies, Lucknow');
  console.log('===============================================================\n');

  // Helper to extract id string
  const getIdStr = (val) => {
    if (!val) return 'N/A';
    if (typeof val === 'object') return (val._id || val.id || JSON.stringify(val)).toString().slice(-8);
    return val.toString().slice(-8);
  };

  // 1. Users Summary
  console.log(`👤 USERS (${data.users?.length || 0} Records):`);
  console.table(
    (data.users || []).map((u) => ({
      ID: getIdStr(u._id || u.id),
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Dept: u.department,
      Verified: u.isVerified ? '✅ Yes' : '❌ No',
    }))
  );

  // 2. Events Summary
  console.log(`\n🎉 EVENTS (${data.events?.length || 0} Records):`);
  console.table(
    (data.events || []).map((e) => ({
      ID: getIdStr(e._id),
      Title: e.title?.length > 30 ? e.title.slice(0, 27) + '...' : e.title,
      Category: e.category,
      Fee: e.fee === 0 ? 'Free (₹0)' : `₹${e.fee}`,
      Capacity: e.capacity,
      Status: e.status === 'published' ? '🟢 Published' : e.status === 'completed' ? '🏁 Completed' : e.status,
      StartDate: e.startDate ? e.startDate.toString().slice(0, 10) : 'TBD',
    }))
  );

  // 3. Registrations Summary
  console.log(`\n🎟️ REGISTRATIONS (${data.registrations?.length || 0} Records):`);
  console.table(
    (data.registrations || []).map((r) => ({
      Ticket: r.ticketCode,
      UserID: getIdStr(r.user),
      EventID: getIdStr(r.event),
      Payment: r.paymentStatus,
      Status: r.status === 'registered' ? '✅ Registered' : r.status,
    }))
  );

  // 4. Certificates Summary
  console.log(`\n📜 CERTIFICATES (${data.certificates?.length || 0} Records):`);
  console.table(
    (data.certificates || []).map((c) => ({
      CertID: c.certificateId,
      UserID: getIdStr(c.user),
      EventID: getIdStr(c.event),
      URL: c.certUrl,
    }))
  );

  console.log('\n💡 Data Source File: backend/data/store.json');
  console.log('🌐 Web Admin GUI: http://localhost:5173/admin/dashboard\n');
} catch (err) {
  console.error('Error reading database:', err.message);
}
