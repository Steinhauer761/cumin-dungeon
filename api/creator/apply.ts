export const config = { runtime: 'edge' };

/**
 * POST /api/creator/apply
 * Body: { "email": "...", "stageName": "...", "dateOfBirth": "2004-01-15", "idPhotoUrl": "...", "selfieUrl": "..." }
 *
 * Performer submits their application with:
 * - Government ID photo
 * - Selfie holding a sign with site name + today's date
 * - Date of birth (must be 18+)
 *
 * Application goes to "pending" status. Jay reviews manually.
 */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: {
    email?: string;
    stageName?: string;
    dateOfBirth?: string;
    idPhotoUrl?: string;
    selfieUrl?: string;
    agreedToTerms?: boolean;
  } = {};

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate required fields
  if (!body.email || !body.stageName || !body.dateOfBirth || !body.idPhotoUrl || !body.selfieUrl) {
    return Response.json({ error: 'email, stageName, dateOfBirth, idPhotoUrl, and selfieUrl are all required' }, { status: 400 });
  }

  if (!body.agreedToTerms) {
    return Response.json({ error: 'Must agree to performer terms' }, { status: 400 });
  }

  // Check age (must be 18+)
  const dob = new Date(body.dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;

  if (actualAge < 18) {
    return Response.json({ error: 'Must be 18 or older to apply' }, { status: 403 });
  }

  const application = {
    id: crypto.randomUUID(),
    email: body.email,
    stageName: body.stageName,
    dateOfBirth: body.dateOfBirth,
    age: actualAge,
    idPhotoUrl: body.idPhotoUrl,
    selfieUrl: body.selfieUrl,
    status: 'pending', // pending -> approved | rejected
    submittedAt: new Date().toISOString(),
  };

  console.info('New performer application', { id: application.id, stageName: body.stageName, age: actualAge });

  return Response.json({
    ...application,
    message: 'Application received. You will be reviewed within 24-48 hours. Once approved you can go live.',
  }, { status: 201 });
}
