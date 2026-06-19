import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function setupTestUsers() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    const connection = await pool.getConnection();

    // Verificar estructura de tabla
    console.info("\n📋 Estructura de tabla dashboard_users:");
    const [columns]: any = await connection.query(
      `DESCRIBE dashboard_users`
    );
    console.table(columns);

    // Verificar usuarios existentes
    console.info("\n👥 Usuarios existentes:");
    const [users]: any = await connection.query(
      `SELECT id, username, nombres, email, id_rol, estado FROM dashboard_users`
    );
    console.table(users);

    // Crear usuarios de prueba
    const testUsers = [
      {
        username: "admin",
        password: "admin123",
        nombres: "Administrador",
        email: "admin@dashboard.com",
        id_rol: 1,
      },
      {
        username: "jefe",
        password: "jefe123",
        nombres: "Jefe de Ventas",
        email: "jefe@dashboard.com",
        id_rol: 2,
      },
      {
        username: "usuario",
        password: "usuario123",
        nombres: "Usuario Vendedor",
        email: "usuario@dashboard.com",
        id_rol: 3,
      },
    ];

    console.info("\n🔐 Creando usuarios de prueba...");

    for (const user of testUsers) {
      // Verificar si el usuario ya existe
      const [existing]: any = await connection.query(
        `SELECT id FROM dashboard_users WHERE username = ?`,
        [user.username]
      );

      if (existing.length > 0) {
        console.info(`✓ Usuario "${user.username}" ya existe`);
        continue;
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(user.password, 10);

      // Insertar usuario
      await connection.query(
        `INSERT INTO dashboard_users 
         (username, nombres, email, id_rol, estado, password_hash, created_at) 
         VALUES (?, ?, ?, ?, 1, ?, NOW())`,
        [user.username, user.nombres, user.email, user.id_rol, passwordHash]
      );

      console.info(`✓ Usuario "${user.username}" creado exitosamente`);
      console.info(`  - Contraseña: ${user.password}`);
      console.info(`  - Rol: ${user.id_rol === 1 ? "Admin" : user.id_rol === 2 ? "Jefe" : "Usuario"}`);
    }

    console.info("\n✅ Setup completado");

    connection.release();
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await pool.end();
  }
}

setupTestUsers();
