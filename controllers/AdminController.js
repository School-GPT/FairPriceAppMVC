const AdminModel = require('../models/AdminModel');

exports.dashboard = (req, res) => {
    AdminModel.getDashboardMetrics((err, metrics) => {
        if (err) throw err;

        AdminModel.getLowStockItems((err2, lowStock) => {
            if (err2) throw err2;

            AdminModel.getRecentOrders((err3, recentOrders) => {
                if (err3) throw err3;

                res.render('admin/dashboard', {
                    metrics: metrics[0],
                    lowStock,
                    recentOrders,
                    user: req.session.user
                });
            });
        });
    });
};
