-- AdCell — schema MySQL
-- Rode este arquivo uma vez no phpMyAdmin da Hostinger.

CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT NULL,
  preco_centavos INT NOT NULL DEFAULT 0,
  preco_promocional_centavos INT NULL,
  categoria_id INT NULL,
  foto VARCHAR(500) NULL,
  destaque BOOLEAN NOT NULL DEFAULT FALSE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_produtos_categoria
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_produtos_categoria ON produtos (categoria_id);
CREATE INDEX idx_produtos_ativo ON produtos (ativo);
CREATE INDEX idx_produtos_destaque ON produtos (destaque);

-- Catálogo por marca/modelo (usado por inventory.server.ts)
CREATE TABLE IF NOT EXISTS inventory_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  kind VARCHAR(100) NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL DEFAULT '',
  model VARCHAR(255) NOT NULL DEFAULT '',
  color VARCHAR(255) NOT NULL DEFAULT '',
  photo VARCHAR(500) NULL,
  photo_file VARCHAR(500) NULL,
  sale_price INT NOT NULL DEFAULT 0,
  sku VARCHAR(100) NULL,
  stock INT NOT NULL DEFAULT 0,
  film_type VARCHAR(100) NOT NULL DEFAULT '',
  description TEXT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  category_id INT NULL,
  CONSTRAINT fk_inventory_products_category
    FOREIGN KEY (category_id) REFERENCES inventory_categories(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_inventory_products_brand ON inventory_products (brand);
CREATE INDEX idx_inventory_products_model ON inventory_products (model);
CREATE INDEX idx_inventory_products_active ON inventory_products (active);

-- Configurações da loja (WhatsApp, redes, endereço)
CREATE TABLE IF NOT EXISTS store_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  whatsapp VARCHAR(50) NOT NULL DEFAULT '',
  instagram VARCHAR(255) NOT NULL DEFAULT '',
  facebook VARCHAR(255) NOT NULL DEFAULT '',
  address VARCHAR(500) NOT NULL DEFAULT '',
  maps_url VARCHAR(500) NOT NULL DEFAULT '',
  hours VARCHAR(500) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Depoimentos
CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ordens de serviço (consulta pública)
CREATE TABLE IF NOT EXISTS service_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  os_number VARCHAR(50) NOT NULL UNIQUE,
  cpf VARCHAR(20) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'recebido',
  brand VARCHAR(255) NOT NULL DEFAULT '',
  model VARCHAR(255) NOT NULL DEFAULT '',
  public_note TEXT NULL,
  updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_service_orders_cpf ON service_orders (cpf);

-- Chamados de assistência (formulário público)
CREATE TABLE IF NOT EXISTS problem_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  email VARCHAR(255) NULL,
  brand VARCHAR(255) NOT NULL DEFAULT '',
  model VARCHAR(255) NOT NULL DEFAULT '',
  problem TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'novo',
  created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
