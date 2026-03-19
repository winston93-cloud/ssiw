import mysql from 'mysql2/promise';

// Configuración serverless-friendly (sin pool persistente)
export async function queryMySQL(sql: string, params?: any[]) {
  let connection;
  try {
    // Crear conexión individual por cada query (mejor para serverless)
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'www.winston93.edu.mx',
      user: process.env.MYSQL_USER || 'winston_richard',
      password: process.env.MYSQL_PASSWORD || '101605',
      database: process.env.MYSQL_DATABASE || 'winston_general',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
    });

    const [rows] = await connection.execute(sql, params);
    return { data: rows, error: null };
  } catch (error: any) {
    console.error('MySQL Error:', error);
    return { data: null, error: error.message };
  } finally {
    // Cerrar conexión después de cada query
    if (connection) {
      await connection.end();
    }
  }
}
