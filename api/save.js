import { put } from '@vercel/blob';

/**
 * Vercel Serverless Function to handle saving credential data to Vercel Blob storage.
 * 
 * Requirements:
 * - Accept POST requests only
 * - Read req.body (username/demoUser and password/demoText)
 * - Save to Vercel Blob in a structured format with private access
 */
export default async function handler(req, res) {
  // Accept POST requests only
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Only POST is allowed.` });
  }

  try {
    // Read body parameters supporting both structural keys and original demo keys
    const { username, password, demoUser, demoText } = req.body || {};

    const finalUsername = username || demoUser;
    const finalPassword = password || demoText;

    if (finalUsername === undefined || finalPassword === undefined) {
      return res.status(400).json({ error: 'Missing username or password in request body.' });
    }

    // Generate ISO timestamp
    const isoTimestamp = new Date().toISOString();

    // Create filename using timestamp
    const safeTimestamp = isoTimestamp.replace(/:/g, '-');
    const filename = `submissions/submission_${safeTimestamp}.json`;

    // Structure credential data cleanly and securely
    const dataToSave = {
      username: finalUsername,
      password: finalPassword,
      timestamp: isoTimestamp,
    };

    // Save JSON data to Vercel Blob with private access
    const blob = await put(filename, JSON.stringify(dataToSave, null, 2), {
      access: 'private',
      addRandomSuffix: true,
      contentType: 'application/json',
    });

    console.log(`Successfully saved structured private blob: ${blob.url}`);

    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving data to Vercel Blob:', error);
    return res.status(500).json({ error: 'Failed to save data to Blob storage.' });
  }
}
