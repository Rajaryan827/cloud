const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
  });

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(express.static('public'));

// Upload route
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image uploaded' 
      });
    }

    const file = req.files.image;
    
    // Convert the file to base64
    const base64Data = file.data.toString('base64');
    const dataURI = `data:${file.mimetype};base64,${base64Data}`;

    // Upload to Cloudinary using upload preset
    const result = await cloudinary.uploader.upload(dataURI, {
      upload_preset: 'ml_default',
      resource_type: 'auto'
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Upload failed' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});