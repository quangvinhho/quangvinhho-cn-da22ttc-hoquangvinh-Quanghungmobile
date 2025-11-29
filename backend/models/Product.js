// Model sản phẩm - tương ứng với product-data.json hiện tại

// Ví dụ với Sequelize (MySQL)
/*
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        originalPrice: {
            type: DataTypes.DECIMAL(10, 2)
        },
        image: {
            type: DataTypes.STRING
        },
        category: {
            type: DataTypes.STRING
        },
        brand: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });

    return Product;
};
*/

// Placeholder - sẽ implement khi chọn loại CSDL
module.exports = {};
