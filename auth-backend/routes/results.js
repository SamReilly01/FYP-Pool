const express = require('express');
const pool = require('../models/db');
const router = express.Router();

// Create a new simulation result entry
router.post('/save', async (req, res) => {
    const { user_id, simulation_name, image_url, ball_positions, initial_positions, pocketed_balls, player_level } = req.body;
    
    try {
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const result = await pool.query(
            `INSERT INTO simulation_results 
            (user_id, simulation_name, image_url, ball_positions, initial_positions, pocketed_balls, player_level, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
            RETURNING *`,
            [
                user_id, 
                simulation_name || 'Untitled Simulation', 
                image_url, 
                JSON.stringify(ball_positions), 
                JSON.stringify(initial_positions), 
                JSON.stringify(pocketed_balls), 
                player_level || 'intermediate'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Simulation results saved successfully',
            simulation_id: result.rows[0].id,
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error saving simulation results:', err);
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
});

// Get all simulation results for a user
router.get('/user/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const results = await pool.query(
            'SELECT * FROM simulation_results WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );

        res.json({
            success: true,
            count: results.rows.length,
            data: results.rows
        });
    } catch (err) {
        console.error('Error retrieving simulation results:', err);
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
});

// Get a specific simulation result by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM simulation_results WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Simulation result not found' });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        console.error('Error retrieving simulation result:', err);
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
});

// Delete a simulation result
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    try {
        // First check if the simulation belongs to the user
        const checkResult = await pool.query(
            'SELECT user_id FROM simulation_results WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Simulation result not found' });
        }

        if (checkResult.rows[0].user_id != user_id) {
            return res.status(403).json({ error: 'Unauthorized: You cannot delete this simulation' });
        }

        // Delete the simulation
        await pool.query(
            'DELETE FROM simulation_results WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            message: 'Simulation result deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting simulation result:', err);
        res.status(500).json({ error: 'Internal server error: ' + err.message });
    }
});

module.exports = router;