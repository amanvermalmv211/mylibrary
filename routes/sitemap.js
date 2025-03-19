import { SitemapStream, streamToPromise } from 'sitemap';
import { createGzip } from 'zlib';
import express from 'express';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
    try {
        const smStream = new SitemapStream({ hostname: 'https://merilibrary.in/' });
        const pipeline = smStream.pipe(createGzip());

        // Add Static Pages
        smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
        smStream.write({ url: '/libraries', changefreq: 'weekly', priority: 0.9 });
        smStream.write({ url: '/login', changefreq: 'weekly', priority: 0.9 });
        smStream.write({ url: '/signup', changefreq: 'weekly', priority: 0.9 });
        smStream.write({ url: '/signup/library-owner', changefreq: 'weekly', priority: 0.9 });
        smStream.write({ url: '/signup/student', changefreq: 'weekly', priority: 0.9 });
        smStream.write({ url: '/about', changefreq: 'weekly', priority: 0.9 });
        smStream.write({ url: '/sarkari-results', changefreq: 'monthly', priority: 0.8 });
        smStream.write({ url: '/ebooks', changefreq: 'monthly', priority: 0.8 });
        smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.8 });
        smStream.write({ url: '/terms-and-conditions', changefreq: 'yearly', priority: 0.5 });

        smStream.end();
        streamToPromise(pipeline).then(sm => res.status(200).header('Content-Type', 'application/xml').send(sm));

    } catch (error) {
        console.error('Sitemap generation failed:', error);
        res.status(500).send('Error generating sitemap');
    }
});

export default router;