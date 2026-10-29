require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const M = require('./models');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all(Object.values(M).map(x => x.deleteMany({})));
  const pw = await bcrypt.hash('Farm@12345', 10);
  const [admin, farmer] = await M.User.create([{ name: 'Admin', email: 'admin@agritech.com', password: pw, role: 'admin' }, { name: 'Sunita Verma', email: 'farmer@agritech.com', password: pw }]);
  const farm = await M.Farm.create({ owner: farmer._id, name: 'River Side Plot', location: 'Bhopal, MP', areaAcres: 6, soilType: 'Alluvial soil' });
  await M.Crop.create({ owner: farmer._id, farm: farm._id, name: 'Wheat', sowingDate: new Date(), ph: 5.6, nitrogen: 240, phosphorus: 9, potassium: 140, soilReport: 'Soil is acidic: add lime. Low nitrogen: apply urea or compost. Low phosphorus: apply DAP or SSP.' });
  await M.Resource.create([{ name: 'DAP Fertilizer (50 kg)', category: 'Fertilizer', price: 1350, stock: 120 }, { name: 'Certified Chickpea Seeds (10 kg)', category: 'Seeds', price: 900, stock: 80 }, { name: 'Bio Pesticide (1 L)', category: 'Pesticide', price: 380, stock: 60 }]);
  await M.Alert.create([{ title: 'Aphid attack warning', message: 'Aphids are rising in mustard and wheat. Spray a bio pesticide early morning.', crop: 'Wheat', severity: 'high' }, { title: 'Termite watch', message: 'Check field edges for termite mounds.', crop: 'Chickpea', severity: 'medium' }]);
  await M.Post.create({ owner: farmer._id, authorName: 'Sunita Verma', type: 'question', title: 'Which wheat variety suits my soil?', body: 'Alluvial soil near Bhopal, 6 acres.' });
  console.log('Seeded. Admin: admin@agritech.com, Farmer: farmer@agritech.com, password: Farm@12345');
  process.exit();
})();
