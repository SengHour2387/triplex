import pool from '../db.js';

export async function createTripPlan(req, res) {
  const { title, caption, start, waypoints, end } = req.body;
  const ownerId = req.user.id; // Decoded from access token in authenticate middleware

  if (!title) {
    return res.status(400).json({
      status: 'error',
      message: 'trip_plan/title_required'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert into trip_plans table
    const planResult = await client.query(
      `INSERT INTO trip_plans (owner_id, title, description) 
       VALUES ($1, $2, $3) 
       RETURNING id, owner_id, title, description as caption, total_cost, total_cost_currency, created_at, updated_at`,
      [ownerId, title, caption]
    );

    const tripPlanId = planResult.rows[0].id;
    const insertedStops = [];

    // Helper function to insert a stop
    const insertStop = async (stop, role, sortOrder) => {
      if (!stop) return;
      const stopResult = await client.query(
        `INSERT INTO trip_plan_stops 
          (trip_plan_id, title, role, location, place_id, latitude, longitude, description, cost, currency, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, trip_plan_id, title, role, location, place_id, latitude, longitude, description, cost, currency, sort_order, created_at, updated_at`,
        [
          tripPlanId,
          stop.title,
          role,
          stop.location || null,
          stop.placeId || null,
          stop.latitude != null ? parseFloat(stop.latitude) : null,
          stop.longitude != null ? parseFloat(stop.longitude) : null,
          stop.description || null,
          stop.cost != null ? parseFloat(stop.cost) : null,
          stop.currency || null,
          sortOrder
        ]
      );
      insertedStops.push(stopResult.rows[0]);
    };

    // 2. Insert start stop (if provided)
    if (start) {
      await insertStop(start, 'start', 0);
    }

    // 3. Insert waypoints
    if (waypoints && Array.isArray(waypoints)) {
      for (let i = 0; i < waypoints.length; i++) {
        await insertStop(waypoints[i], 'waypoint', i + 1);
      }
    }

    // 4. Insert end stop (if provided)
    if (end) {
      const endSortOrder = (waypoints ? waypoints.length : 0) + 1;
      await insertStop(end, 'end', endSortOrder);
    }

    await client.query('COMMIT');

    // Fetch the updated trip plan to include the total_cost trigger recalculation from the DB trigger
    const finalPlanResult = await client.query(
      `SELECT id, owner_id, title, description as caption, total_cost, total_cost_currency, created_at, updated_at
       FROM trip_plans WHERE id = $1`,
      [tripPlanId]
    );

    res.status(201).json({
      status: 'success',
      data: {
        tripPlan: finalPlanResult.rows[0],
        stops: insertedStops
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating trip plan:', error);
    res.status(500).json({
      status: 'error',
      message: 'trip_plan/creation_failed',
      error: error.message
    });
  } finally {
    client.release();
  }
}

export async function getTripPlans(req, res) {
  try {
    const ownerId = req.user.id;
    const plansResult = await pool.query(
      `SELECT id, owner_id, title, description as caption, total_cost, total_cost_currency, created_at, updated_at
       FROM trip_plans
       WHERE owner_id = $1
       ORDER BY created_at DESC`,
      [ownerId]
    );

    const plans = plansResult.rows;

    for (const plan of plans) {
      const stopsResult = await pool.query(
        `SELECT id, trip_plan_id, title, role, location, place_id, latitude, longitude, description, cost, currency, sort_order, created_at, updated_at
         FROM trip_plan_stops
         WHERE trip_plan_id = $1
         ORDER BY sort_order ASC`,
        [plan.id]
      );
      plan.waypoints = stopsResult.rows.filter(s => s.role === 'waypoint');
      plan.start = stopsResult.rows.find(s => s.role === 'start') || null;
      plan.end = stopsResult.rows.find(s => s.role === 'end') || null;
    }

    res.status(200).json({
      status: 'success',
      data: plans
    });
  } catch (error) {
    console.error('Error fetching trip plans:', error);
    res.status(500).json({
      status: 'error',
      message: 'trip_plan/fetch_failed',
      error: error.message
    });
  }
}

export async function getTripPlanById(req, res) {
  const { id } = req.params;
  try {
    const planResult = await pool.query(
      `SELECT id, owner_id, title, description as caption, total_cost, total_cost_currency, created_at, updated_at
       FROM trip_plans
       WHERE id = $1`,
      [id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'trip_plan/not_found'
      });
    }

    const plan = planResult.rows[0];

    const stopsResult = await pool.query(
      `SELECT id, trip_plan_id, title, role, location, place_id, latitude, longitude, description, cost, currency, sort_order, created_at, updated_at
       FROM trip_plan_stops
       WHERE trip_plan_id = $1
       ORDER BY sort_order ASC`,
      [id]
    );

    plan.waypoints = stopsResult.rows.filter(s => s.role === 'waypoint');
    plan.start = stopsResult.rows.find(s => s.role === 'start') || null;
    plan.end = stopsResult.rows.find(s => s.role === 'end') || null;

    res.status(200).json({
      status: 'success',
      data: plan
    });
  } catch (error) {
    console.error('Error fetching trip plan details:', error);
    res.status(500).json({
      status: 'error',
      message: 'trip_plan/fetch_detail_failed',
      error: error.message
    });
  }
}

export async function deleteTripPlan(req, res) {
  const { id } = req.params;
  const ownerId = req.user.id;

  try {
    const result = await pool.query(
      `DELETE FROM trip_plans
       WHERE id = $1 AND owner_id = $2
       RETURNING id`,
      [id, ownerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'trip_plan/not_found_or_unauthorized'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Trip plan deleted successfully',
      data: { id: result.rows[0].id }
    });
  } catch (error) {
    console.error('Error deleting trip plan:', error);
    res.status(500).json({
      status: 'error',
      message: 'trip_plan/delete_failed',
      error: error.message
    });
  }
}

