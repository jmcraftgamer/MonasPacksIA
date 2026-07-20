-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  nome TEXT,
  plano TEXT DEFAULT 'gratuito',
  downloads_gratis INTEGER DEFAULT 3,
  criado_em TIMESTAMPTZ DEFAULT now(),
  assinatura_inicio TIMESTAMPTZ,
  assinatura_fim TIMESTAMPTZ
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  subcategoria TEXT DEFAULT '',
  tipo TEXT DEFAULT 'unico',
  imagem TEXT DEFAULT '',
  download_url TEXT DEFAULT '',
  criado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE produtos ADD COLUMN IF NOT EXISTS imagem TEXT DEFAULT '';

-- Tabela de arquivos de packs
CREATE TABLE IF NOT EXISTS arquivos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL
);

-- Tabela de downloads
CREATE TABLE IF NOT EXISTS downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  produto_id UUID REFERENCES produtos(id),
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  valor DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pendente',
  mes_ref DATE,
  criado_em TIMESTAMPTZ DEFAULT now()
);

