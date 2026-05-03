const CrudRepository = require('./crud-repository');
const { Version, User } = require('../models');

class VersionRepository extends CrudRepository {
    constructor() {
        super(Version);
    }

    // Get all versions for a document
    async getByDocument(documentId) {
        const versions = await Version.findAll({
            where: { documentId },
            include: [{
                model: User,
                as: 'savedBy',
                attributes: ['id', 'name', 'avatar']
            }],
            order: [['versionNumber', 'DESC']]
        });
        return versions;
    }

    // Get latest version number for a document
    async getLatestVersionNumber(documentId) {
        const latest = await Version.findOne({
            where: { documentId },
            order: [['versionNumber', 'DESC']]
        });
        return latest ? latest.versionNumber : 0;
    }
}

module.exports = VersionRepository;