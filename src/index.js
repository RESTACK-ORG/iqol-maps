require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

const cors = require('cors');
app.use(cors());


app.use(express.json()); // so we can read JSON requests

// Test route
app.get('/', (req, res) => {
    res.send('API is working');
});

app.get('/api/hightension', async (req, res) => {
    res.json({ message: "It works!" });
    try {
        const data = await prisma.hightension.findMany();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Metro lines & stations
app.get('/api/metro', async (req, res) => {
    try {
        const data = await prisma.metro.findMany();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Urban
app.get('/api/urban', async (req, res) => {
    try {
        const data = await prisma.urban_final_final.findMany();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Rural areas
app.get('/api/rural', async (req, res) => {
    try {
        const data = await prisma.rural_final___rural_sort_of_final.findMany();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. BBMP wards
app.get('/api/bbmp', async (req, res) => {
    try {
        const data = await prisma.bbmp___BBMP_198_Sheet_Attributes.findMany();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Infra: NICE Ring Road
app.get('/api/nice', async (req, res) => {
    try {
        const data = await prisma.NICE_Ring_Road.findMany();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. ORR Revised
app.get('/api/orr', async (req, res) => {
    try {
        const data = await prisma.orr_revised.findMany();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Peripheral Ring Road
app.get('/api/peripheral', async (req, res) => {
    try {
        const data = await prisma.peripheral_proposed.findMany();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. STRR Proposed
app.get('/api/strr-proposed', async (req, res) => {
    try {
        const data = await prisma.strr_proposed.findMany();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 10. STRR Revised
app.get('/api/strr', async (req, res) => {
    try {
        const data = await prisma.strr_revised.findMany();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 11. Suburban Railway
app.get('/api/suburban', async (req, res) => {
    try {
        const data = await prisma.suburb_railway.findMany();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

