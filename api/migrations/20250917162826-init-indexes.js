module.exports = {
  async up(db) {
    await db.collection('pnlperiods').createIndex({ companyId: 1, periodStart: 1 }, { unique: true });
  },
  async down(db) {
    await db.collection('pnlperiods').dropIndex({ companyId: 1, periodStart: 1 });
  }
};
