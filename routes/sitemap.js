import express from "express";

const router = express.Router();

router.get("/sitemap.xml", (req, res) => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>https://merilibrary.in/</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
        <url>
            <loc>https://merilibrary.in/libraries</loc>
            <changefreq>weekly</changefreq>
            <priority>0.9</priority>
        </url>
        <url>
            <loc>https://merilibrary.in/login</loc>
            <changefreq>weekly</changefreq>
            <priority>0.9</priority>
        </url>
        <url>
            <loc>https://merilibrary.in/signup</loc>
            <changefreq>weekly</changefreq>
            <priority>0.9</priority>
        </url>
        <url>
            <loc>https://merilibrary.in/signup/library-owner</loc>
            <changefreq>weekly</changefreq>
            <priority>0.9</priority>
        </url>
        <url>
            <loc>https://merilibrary.in/signup/student</loc>
            <changefreq>weekly</changefreq>
            <priority>0.9</priority>
        </url>
        <url>
            <loc>https://merilibrary.in/about</loc>
            <changefreq>weekly</changefreq>
            <priority>0.9</priority>
        </url>
        <url>
            <loc>https://merilibrary.in/sarkari-results</loc>
            <changefreq>monthly</changefreq>
            <priority>0.8</priority>
        </url>
        <url>
            <loc>https://merilibrary.in/ebooks</loc>
            <changefreq>monthly</changefreq>
            <priority>0.8</priority>
        </url>
        <url>
            <loc>https://merilibrary.in/contact</loc>
            <changefreq>monthly</changefreq>
            <priority>0.8</priority>
        </url>
        <url>
            <loc>https://merilibrary.in/terms-and-conditions</loc>
            <changefreq>yearly</changefreq>
            <priority>0.5</priority>
        </url>
    </urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
});

export default router;