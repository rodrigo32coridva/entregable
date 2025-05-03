-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS bodega;
USE bodega;

-- 2. Crear la tabla marcas
CREATE TABLE IF NOT EXISTS marcas (
  idmarca INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(255) NOT NULL
);

-- 3. Crear la tabla categorias (si es necesario)
CREATE TABLE IF NOT EXISTS categorias (
  idcategoria INT AUTO_INCREMENT PRIMARY KEY,
  categoria VARCHAR(255) NOT NULL
);

-- 4. Crear la tabla vinos con la clave foránea correctamente referenciada
CREATE TABLE IF NOT EXISTS vinos (
  idvino INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  idmarca INT,
  variedad VARCHAR(100) NOT NULL,
  anio INT NOT NULL,
  tipo ENUM('Tinto', 'Blanco', 'Rosado', 'Espumoso') NOT NULL,
  alcohol DECIMAL(4,2) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  imagen_url VARCHAR(500),
  FOREIGN KEY (idmarca) REFERENCES marcas(idmarca) ON DELETE SET NULL
);

-- 5. Insertar datos en la tabla marcas
INSERT INTO marcas (marca) VALUES
('Vino'),
('Pisco'),
('Espumantes'),
('RTD'),
('Sangrías');

-- 6. Insertar datos en la tabla vinos
INSERT INTO vinos (nombre, idmarca, variedad, anio, tipo, alcohol, precio, imagen_url) VALUES
('Gran Reserva', 1, 'Cabernet Sauvignon', 2018, 'Tinto', 13.5, 75.00, NULL),
('Blanco del Valle', 1, 'Sauvignon Blanc', 2020, 'Blanco', 12.0, 50.00, NULL),
('Viña Roja', 1, 'Merlot', 2019, 'Tinto', 14.0, 80.00, NULL),
('Pisco Reserva', 2, 'Pisco', 2020, 'Licor', 40.0, 100.00, NULL),
('Espumante Del Sol', 3, 'Chardonnay', 2021, 'Espumante', 11.5, 60.00, NULL);

-- 7. Consultar los datos de los vinos y las marcas
SELECT 
  V.idvino,
  M.marca AS marca,
  V.nombre,
  V.variedad,
  V.anio,
  V.tipo,
  V.alcohol,
  V.precio,
  V.imagen_url  
FROM vinos V
INNER JOIN marcas M ON V.idmarca = M.idmarca;

-- 8. Consultar solo los idvino, nombre y precio de los vinos
SELECT idvino, nombre, precio FROM vinos;
