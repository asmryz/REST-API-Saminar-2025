import express from 'express';
const router = express.Router();

import { sql } from '../config/db.js';

router.get('/continents', async (req, res) => {
    const continents = await sql`SELECT * FROM continent`;
    res.status(200).json(continents);
});

router.get('/countries', async (req, res) => {
    const countries = await sql`SELECT * FROM country`;
    res.status(200).json(countries);
});

router.get('/countries/:code', async (req, res) => {
    const { code } = req.params
    const countries = await sql`SELECT * FROM country WHERE continent = ${code.toLocaleUpperCase()}`;
    res.status(200).json(countries);
});

/*
curl -X POST http://localhost:8000/api/countries \
  -H "Content-Type: application/json" \
  -d '{
    "code": "DL",
    "name": "Disneyland",
    "full_name": "Disneyland",
    "iso3": "DLD",
    "iso_number": 999,
    "continent": "NA"
  }'
*/

router.post('/countries', async (req, res) => {
    try {
        const { code, name, full_name, iso3, iso_number, continent } = req.body;
        
        const result = await sql`
            INSERT INTO country (code, name, full_name, iso3, iso_number, continent)
            VALUES (${code}, ${name}, ${full_name}, ${iso3}, ${iso_number}, ${continent})
            RETURNING *
        `;
        
        res.status(201).json(result[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/*
curl -X PUT http://localhost:8000/api/countries/DL \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Disneyland Resort",
    "full_name": "Disneyland Resort California",
    "iso3": "DLD",
    "iso_number": 999,
    "continent": "NA"
  }'
*/
router.put('/countries/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { name, full_name, iso3, iso_number, continent } = req.body;
        
        const result = await sql`
            UPDATE country
            SET name = ${name}, 
                full_name = ${full_name}, 
                iso3 = ${iso3}, 
                iso_number = ${iso_number}, 
                continent = ${continent}
            WHERE code = ${code.toUpperCase()}
            RETURNING *
        `;
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Country not found' });
        }
        
        res.status(200).json(result[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/*
curl -X PATCH http://localhost:8000/api/countries/DL \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Disneyland - The Happiest Place on Earth"
  }'
*/
router.patch('/countries/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const { name, full_name, iso3, iso_number, continent } = req.body;
        
        // Get current country data
        const [country] = await sql`SELECT * FROM country WHERE code = ${code.toUpperCase()}`;
        
        if (!country) {
            return res.status(404).json({ error: 'Country not found' });
        }
        
        // Merge with updates (only provided fields will be updated)
        const updated = {
            name: name ?? country.name,
            full_name: full_name ?? country.full_name,
            iso3: iso3 ?? country.iso3,
            iso_number: iso_number ?? country.iso_number,
            continent: continent ?? country.continent
        };
        
        const [result] = await sql`
            UPDATE country
            SET name = ${updated.name}, 
                full_name = ${updated.full_name}, 
                iso3 = ${updated.iso3}, 
                iso_number = ${updated.iso_number}, 
                continent = ${updated.continent}
            WHERE code = ${code.toUpperCase()}
            RETURNING *
        `;
        
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/*
curl -X DELETE http://localhost:8000/api/countries/IL
*/
router.delete('/countries/:code', async (req, res) => {
    try {
        const { code } = req.params;
        
        const [deleted] = await sql`
            DELETE FROM country
            WHERE code = ${code.toUpperCase()}
            RETURNING *
        `;
        
        if (!deleted) {
            return res.status(404).json({ error: 'Country not found' });
        }
        
        res.status(200).json({ message: 'Country deleted successfully', country: deleted });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;