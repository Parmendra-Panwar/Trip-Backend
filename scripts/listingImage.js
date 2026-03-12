// const mongoose = require("mongoose");
// const Listing = require("../models/listing");
// const path = require('path');
// require('dotenv').config({ path: path.join(__dirname, '../.env') });

// async function migrate() {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("Connected to Database...");

//     // Important: .lean() use karne se Mongoose schema methods bypass ho jate hain 
//     // aur humein raw object milta hai jisme 'image' field visible hogi.
//     const listings = await Listing.find({}).lean(); 
    
//     console.log(`Checking ${listings.length} listings...`);

//     const bulkOps = [];

//     for (let doc of listings) {
//       // Check agar purana 'image' object hai aur naya 'images' array abhi nahi bana
//       if (doc.image && (!doc.images || doc.images[0] === null)) {
//         bulkOps.push({
//           updateOne: {
//             filter: { _id: doc._id },
//             update: { 
//               $set: { images: [doc.image] }, 
//               $unset: { image: "" } 
//             }
//           }
//         });
//       }
//     }

//     if (bulkOps.length > 0) {
//       await Listing.bulkWrite(bulkOps);
//       console.log(`Successfully migrated ${bulkOps.length} documents!`);
//     } else {
//       console.log("No documents found that need migration.");
//     }

//     process.exit(0);
//   } catch (e) {
//     console.error("Migration Error:", e);
//     process.exit(1);
//   }
// }

// async function forceCleanup() {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("Connected for final cleanup...");

//     // Important: { strict: false } lagane se Mongoose schema ko check nahi karega
//     // aur direct MongoDB mein 'image' field ko delete kar dega.
//     const result = await Listing.updateMany(
//       {}, 
//       { $unset: { image: "" } },
//       { strict: false } 
//     );

//     console.log(`Success! Removed 'image' field from ${result.modifiedCount} documents.`);
//     process.exit(0);
//   } catch (e) {
//     console.error("Error during force cleanup:", e);
//     process.exit(1);
//   }
// }

// migrate();

// forceCleanup();
