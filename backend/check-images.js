const mysql = require('mysql2/promise');

async function check() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Vinh123456789@',
    database: 'QHUNG'
  });

  try {
    // Check products with missing images
    const [products] = await pool.query(`
      SELECT ma_sp, ten_sp, anh_dai_dien 
      FROM san_pham 
      WHERE anh_dai_dien IS NULL OR anh_dai_dien = ''
      LIMIT 10
    `);
    
    console.log('Products with NULL/empty image:');
    products.forEach(p => console.log(`  ${p.ma_sp}: ${p.ten_sp} -> ${p.anh_dai_dien}`));
    console.log(`Total: ${products.length}\n`);

    // Check products with images NOT starting with 'images/'
    const [badPath] = await pool.query(`
      SELECT ma_sp, ten_sp, anh_dai_dien 
      FROM san_pham 
      WHERE anh_dai_dien IS NOT NULL 
        AND anh_dai_dien != ''
        AND anh_dai_dien NOT LIKE 'images/%'
      LIMIT 10
    `);
    
    console.log('Products with bad image path (no images/ prefix):');
    badPath.forEach(p => console.log(`  ${p.ma_sp}: ${p.ten_sp} -> ${p.anh_dai_dien}`));
    console.log(`Total: ${badPath.length}\n`);

    // Sample of all products
    const [all] = await pool.query(`SELECT ma_sp, anh_dai_dien FROM san_pham LIMIT 20`);
    console.log('All products sample:');
    all.forEach(p => console.log(`  ${p.ma_sp}: ${p.anh_dai_dien}`));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
