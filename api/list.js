import { list } from '@vercel/blob';

/**
 * Vercel Serverless Function to list and retrieve private demo submissions.
 * 
 * Requirements:
 * - Use @vercel/blob list()
 * - Retrieve saved private blob entries matching our prefix
 * - Fetch/extract the JSON data for each blob
 * - Return JSON array of submissions
 */
export default async function handler(req, res) {
  // Allow GET requests only
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed. Only GET is allowed.` });
  }

  try {
    // 1. List all blobs in the store
    const { blobs } = await list({
      prefix: 'submissions/',
    });

    // 2. Fetch the JSON content of each private blob
    // Since the blobs are private, standard client-side fetches would fail with 403.
    // The server fetches them, optionally appending the read-write token as an authorization header if required.
    const submissions = await Promise.all(
      blobs.map(async (blob) => {
        try {
          const token = process.env.BLOB_READ_WRITE_TOKEN;
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          
          const response = await fetch(blob.url, { headers });
          if (!response.ok) {
            throw new Error(`Failed to fetch blob content: ${response.statusText}`);
          }
          const content = await response.json();
          
          return {
            pathname: blob.pathname,
            url: blob.url,
            size: blob.size,
            uploadedAt: blob.uploadedAt,
            data: content // { demoUser, demoText, timestamp }
          };
        } catch (fetchErr) {
          console.error(`Error reading blob ${blob.pathname}:`, fetchErr);
          // Fallback return if a specific blob content is unreadable
          return {
            pathname: blob.pathname,
            url: blob.url,
            size: blob.size,
            uploadedAt: blob.uploadedAt,
            data: {
              demoUser: 'System',
              demoText: `Unreadable entry: ${fetchErr.message}`,
              timestamp: blob.uploadedAt
            }
          };
        }
      })
    );

    // Sort submissions by timestamp (newest first)
    submissions.sort((a, b) => {
      const timeA = new Date(a.data.timestamp || a.uploadedAt);
      const timeB = new Date(b.data.timestamp || b.uploadedAt);
      return timeB - timeA;
    });

    return res.status(200).json(submissions);
  } catch (error) {
    console.error('Error listing Vercel Blobs:', error);
    return res.status(500).json({ error: 'Failed to retrieve blob entries.' });
  }
}
