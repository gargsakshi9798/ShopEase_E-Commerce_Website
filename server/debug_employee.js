const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopease').then(async () => {
  require('./models/Role'); // register Role schema first
  const User = require('./models/User');
  const SupportTicket = require('./models/SupportTicket');
  const AccountDeletionRequest = require('./models/AccountDeletionRequest');

  // Find all users and their roles
  const allUsers = await User.find({}).populate('role_id', 'slug name').select('name email role_id').limit(15);
  console.log('\n=== USERS ===');
  allUsers.forEach(u => console.log(u.name, '|', u.email, '|', u.role_id?.slug));

  // Find employee specifically
  const emp = allUsers.find(u => u.role_id?.slug === 'employee');
  if (emp) {
    console.log('\n=== EMPLOYEE FOUND ===');
    console.log('ID:', emp._id);
    console.log('Name:', emp.name);

    // Check tickets assigned to this employee
    const tickets = await SupportTicket.find({ assigned_to: emp._id });
    console.log('\nTickets assigned to employee:', tickets.length);

    // Check deletion requests
    const dels = await AccountDeletionRequest.find({ status: { $in: ['pending', 'reviewed'] } });
    console.log('Pending/Reviewed deletion requests:', dels.length);
  } else {
    console.log('\nNo employee found in DB');
  }

  process.exit(0);
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
