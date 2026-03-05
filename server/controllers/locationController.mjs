import { Location } from '../models/location.mjs';

export async function upsertLocation(req, res) {
  const { googlePlaceId, name, address, rating, priceLevel } = req.body;

  if (!googlePlaceId || !name) {
    return res.status(400).json({ error: 'googlePlaceId and name are required' });
  }

  const location = await Location.findOneAndUpdate(
    { googlePlaceId },
    { googlePlaceId, name, address, rating, priceLevel },
    { upsert: true, new: true }
  );

  res.json({ location });
}
