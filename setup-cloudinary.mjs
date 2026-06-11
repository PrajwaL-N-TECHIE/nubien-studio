import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: 'dqts6umdd', 
  api_key: 'YOUR_API_KEY_HERE', 
  api_secret: 'YOUR_API_SECRET_HERE' 
});

async function setup() {
  try {
    const res = await cloudinary.api.create_upload_preset({
      name: 'lms_unsigned',
      unsigned: true,
      folder: 'lms_uploads'
    });
    console.log("SUCCESS:", res.name);
  } catch (error) {
    if (error.error && error.error.message.includes("already exists")) {
       console.log("SUCCESS: lms_unsigned");
    } else {
       console.error("ERROR:", error);
    }
  }
}

setup();
