import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: 'dqts6umdd', 
  api_key: '584213354861186', 
  api_secret: 'F7-Re7e6PucfhqK46lre8Hceil4' 
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
