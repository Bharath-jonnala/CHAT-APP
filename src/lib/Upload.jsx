// lib/upload.jsx

export const upload = async (file) => {
  if (!file) return null;

  const CLOUD_NAME = "dxsfgviht";         
  const UPLOAD_PRESET = "avatars"; 
  const UPLOAD_FOLDER = "avatars";             

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", UPLOAD_FOLDER); // optional

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url; // return the URL for storage in Firestore
  } catch (err) {
    console.error("Cloudinary Upload Failed:", err);
    return null;
  }
};
