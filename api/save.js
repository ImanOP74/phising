import { put } from '@vercel/blob';

/**
 * Vercel Serverless Function to handle saving demo form data to Vercel Blob storage.
 * 
 * Requirements:
 * - Accept POST requests only
 * - Read req.body (demoUser and demoText)
 * - Save to Vercel Blob with private access
 * - Use random suffix
 * - Include ISO timestamp
 */
export default async function handler(req, res) {
  // Accept POST requests only
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Only POST is allowed.` });
  }

  try {
    // Read body parameters
    const { demoUser, demoText } = req.body || {};

    if (demoUser === undefined || demoText === undefined) {
      return res.status(400).json({ error: 'Missing demoUser or demoText in request body.' });
    }

    // Generate ISO timestamp
    const isoTimestamp = new Date().toISOString();

    // Create filename using timestamp
    // e.g., submission_2026-06-02T17-30-00-000Z.json
    const safeTimestamp = isoTimestamp.replace(/:/g, '-');
    const filename = `submissions/submission_${safeTimestamp}.json`;

    // Structure data to save
    const dataToSave = {
      demoUser,
      demoText,
      timestamp: isoTimestamp,
    };

    // Save JSON data to Vercel Blob with private access
    const blob = await put(filename, JSON.stringify(dataToSave, null, 2), {
      access: 'private',
      addRandomSuffix: true,
      contentType: 'application/json',
    });

    console.log(`Successfully saved private blob: ${blob.url}`);

    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving data to Vercel Blob:', error);
    return res.status(500).json({ error: 'Failed to save data to Blob storage.' });
  }
}
