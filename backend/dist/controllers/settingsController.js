import Settings from '../models/Settings.js';
// Get homepage SEO settings
export const getHomepageSEO = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        // If no settings exist, create default one
        if (!settings) {
            settings = await Settings.create({});
        }
        res.status(200).json({
            success: true,
            data: {
                seoTitle: settings.homepageSeoTitle || '',
                seoDescription: settings.homepageSeoDescription || ''
            },
            message: 'Homepage SEO settings retrieved successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching homepage SEO settings',
            error: error.message
        });
    }
};
// Update homepage SEO settings
export const updateHomepageSEO = async (req, res) => {
    try {
        const { seoTitle, seoDescription } = req.body;
        // Validate length
        if (seoTitle && seoTitle.length > 60) {
            res.status(400).json({
                success: false,
                message: 'SEO Title should not exceed 60 characters'
            });
            return;
        }
        if (seoDescription && seoDescription.length > 160) {
            res.status(400).json({
                success: false,
                message: 'SEO Description should not exceed 160 characters'
            });
            return;
        }
        // Get or create settings document
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({
                homepageSeoTitle: seoTitle || '',
                homepageSeoDescription: seoDescription || ''
            });
        }
        else {
            // Update existing settings
            if (seoTitle !== undefined) {
                settings.homepageSeoTitle = seoTitle || '';
            }
            if (seoDescription !== undefined) {
                settings.homepageSeoDescription = seoDescription || '';
            }
            await settings.save();
        }
        res.status(200).json({
            success: true,
            data: {
                seoTitle: settings.homepageSeoTitle || '',
                seoDescription: settings.homepageSeoDescription || ''
            },
            message: 'Homepage SEO settings updated successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating homepage SEO settings',
            error: error.message
        });
    }
};
