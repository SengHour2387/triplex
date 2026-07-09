import { PlacesClient } from '@googlemaps/places';

let placesClientInstance = null;

/**
 * Lazily instantiates and returns the PlacesClient.
 * This prevents issues with dotenv environment variables not being loaded
 * at the time of ES module hoisting/import.
 */
function getPlacesClient() {
  if (!placesClientInstance) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY is not defined in the environment variables.');
    }
    placesClientInstance = new PlacesClient({ apiKey });
  }
  return placesClientInstance;
}

/**
 * Fetch autocomplete suggestions for a given input query.
 * Route: GET /api/map/autocomplete
 * Query params:
 *   - input: string (required)
 *   - sessionToken: string (optional, UUID recommended)
 *   - locationBias: JSON string or object (optional)
 *   - includedRegionCodes: comma-separated string or array (optional)
 *   - languageCode: string (optional)
 */
export const getAutocompleteSuggestions = async (req, res) => {
  const { input, sessionToken, locationBias, includedRegionCodes, languageCode } = req.query;

  if (!input || typeof input !== 'string' || input.trim() === '') {
    return res.status(400).json({
      status: 'error',
      message: 'map/autocomplete_missing_input',
      error: 'Query parameter "input" is required and must be a non-empty string.'
    });
  }

  try {
    const client = getPlacesClient();
    
    // Construct request object
    const request = {
      input: input.trim(),
    };

    if (sessionToken) {
      request.sessionToken = sessionToken;
    }

    if (languageCode) {
      request.languageCode = languageCode;
    }

    // Parse locationBias if provided
    if (locationBias) {
      try {
        request.locationBias = typeof locationBias === 'string' 
          ? JSON.parse(locationBias) 
          : locationBias;
      } catch (err) {
        return res.status(400).json({
          status: 'error',
          message: 'map/autocomplete_invalid_location_bias',
          error: 'Parameter "locationBias" must be a valid JSON string or object.'
        });
      }
    }

    // Parse includedRegionCodes if provided
    if (includedRegionCodes) {
      if (typeof includedRegionCodes === 'string') {
        request.includedRegionCodes = includedRegionCodes.split(',').map(code => code.trim());
      } else if (Array.isArray(includedRegionCodes)) {
        request.includedRegionCodes = includedRegionCodes;
      }
    }

    const [response] = await client.autocompletePlaces(request);

    // If suggestions are not present, return empty array
    const rawSuggestions = response.suggestions || [];

    // Map suggestions to a clean, front-end friendly format
    const suggestions = rawSuggestions.map(item => {
      const prediction = item.placePrediction;
      if (!prediction) {
        return null;
      }

      const placeId = prediction.placeId || (prediction.place ? prediction.place.split('/')[1] : null);

      return {
        placeId,
        displayName: prediction.structuredFormat?.mainText?.text || prediction.text?.text || '',
        formattedAddress: prediction.structuredFormat?.secondaryText?.text || '',
        types: prediction.types || []
      };
    }).filter(Boolean);

    return res.status(200).json({
      status: 'success',
      suggestions
    });

  } catch (error) {
    console.error('Error in getAutocompleteSuggestions:', error);
    
    // Handle specific API error responses if possible
    const statusCode = error.code === 3 ? 400 : 500;
    return res.status(statusCode).json({
      status: 'error',
      message: 'map/autocomplete_failed',
      error: error.message || 'An error occurred while fetching autocomplete suggestions.'
    });
  }
};

/**
 * Fetch detailed information for a specific place.
 * Route: GET /api/map/details/:placeId
 * Query params:
 *   - sessionToken: string (optional, UUID recommended - should match the autocomplete session)
 */
export const getPlaceDetails = async (req, res) => {
  const { placeId } = req.params;
  const { sessionToken } = req.query;

  if (!placeId || typeof placeId !== 'string' || placeId.trim() === '') {
    return res.status(400).json({
      status: 'error',
      message: 'map/details_missing_place_id',
      error: 'Path parameter "placeId" is required.'
    });
  }

  try {
    const client = getPlacesClient();

    // The Google Places API (New) requires place resource name in format: places/PLACE_ID
    const formattedName = placeId.startsWith('places/') ? placeId : `places/${placeId.trim()}`;

    const request = {
      name: formattedName
    };

    if (sessionToken) {
      request.sessionToken = sessionToken;
    }

    // Call the getPlace method with required field masks to prevent charging for unwanted fields.
    // Specifying id, displayName, formattedAddress, and location covers most map search use cases.
    const [place] = await client.getPlace(request, {
      otherArgs: {
        headers: {
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location'
        }
      }
    });

    if (!place) {
      return res.status(404).json({
        status: 'error',
        message: 'map/details_not_found',
        error: 'Place details could not be found for the specified ID.'
      });
    }

    // Map result to a clean structure
    const result = {
      placeId: place.id || placeId,
      displayName: place.displayName?.text || '',
      formattedAddress: place.formattedAddress || '',
      latitude: place.location?.latitude || null,
      longitude: place.location?.longitude || null
    };

    return res.status(200).json({
      status: 'success',
      place: result
    });

  } catch (error) {
    console.error('Error in getPlaceDetails:', error);
    
    const statusCode = error.code === 3 ? 400 : 500;
    return res.status(statusCode).json({
      status: 'error',
      message: 'map/details_failed',
      error: error.message || 'An error occurred while fetching place details.'
    });
  }
};

/**
 * Fetch detailed information for a specific place by ID using native fetch.
 * Route: POST /api/map/details-by-id
 * Body:
 *   - placeId: string (required)
 */
export const getPlaceDetailsById = async (req, res) => {
  const { placeId } = req.body;

  if (!placeId || typeof placeId !== 'string' || placeId.trim() === '') {
    return res.status(400).json({
      status: 'error',
      message: 'map/details_missing_place_id',
      error: 'Body parameter "placeId" is required.'
    });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY is not defined in environment variables.');
    return res.status(500).json({
      status: 'error',
      message: 'map/api_key_missing',
      error: 'Google Maps API Key is not configured on the server.'
    });
  }

  try {
    const fields = 'name,rating,user_ratings_total,opening_hours,formatted_phone_number,photos';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId.trim())}&fields=${fields}&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(400).json({
        status: 'error',
        message: 'map/details_failed',
        error: data.error_message || `Google API returned status: ${data.status}`
      });
    }

    const result = data.result || {};
    
    // Format response
    const place = {
      name: result.name || 'Unknown Venue',
      rating: result.rating || 0.0,
      user_ratings_total: result.user_ratings_total || 0,
      status: result.opening_hours ? (result.opening_hours.open_now ? 'Open' : 'Closed') : 'Unknown',
      formatted_phone_number: result.formatted_phone_number || 'N/A',
      photos: result.photos || []
    };

    return res.status(200).json({
      status: 'success',
      place
    });

  } catch (error) {
    console.error('Error in getPlaceDetailsById:', error);
    return res.status(500).json({
      status: 'error',
      message: 'map/details_failed',
      error: error.message || 'An error occurred while fetching place details.'
    });
  }
};
