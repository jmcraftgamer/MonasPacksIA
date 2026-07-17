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

-- Inserir produtos mockados
INSERT INTO produtos (nome, descricao, categoria, subcategoria, tipo, imagem, download_url) VALUES
('Trilha Épica para Jogos', 'Trilha sonora orquestrada perfeita para montagens épicas de jogos.', 'musica', 'jogos', 'unico', '/placeholder-music.jpg', '/downloads/trilha-epica.mp3'),
('Lo-fi para Vlogs', 'Música Lo-fi relaxante para vlogs do dia a dia.', 'musica', 'vlogs', 'unico', '/placeholder-music.jpg', '/downloads/lofi-vlog.mp3'),
('Risada Clássica', 'Memes de risada para momentos engraçados.', 'memes-video', 'humor', 'unico', '/placeholder-video.jpg', '/downloads/risada.mp4'),
('Surpresa!', 'Meme de susto para react videos.', 'memes-video', 'react', 'unico', '/placeholder-video.jpg', '/downloads/surpresa.mp4'),
('Cara de Trolha', 'Imagem clássica de meme para edições.', 'memes-imagem', 'troll', 'unico', '/placeholder-image.jpg', '/downloads/cara-trolha.png'),
('Drake Aprova/Desaprova', 'Meme do Drake para comparações.', 'memes-imagem', 'comparacao', 'unico', '/placeholder-image.jpg', '/downloads/drake.png'),
('Explosão Cinematográfica', 'Efeito sonoro de explosão para cenas de ação.', 'efeitos', 'acao', 'unico', '/placeholder-audio.jpg', '/downloads/explosao.mp3'),
('Transição Suave', 'Efeito sonoro para transições entre cenas.', 'efeitos', 'transicao', 'unico', '/placeholder-audio.jpg', '/downloads/transicao.mp3'),
('Pack Completo para Gaming', 'Pacote completo com trilhas, efeitos e memes para videos de games.', 'packs', 'gaming', 'pack', '/placeholder-pack.jpg', '/downloads/pack-gaming.zip'),
('Pack para Vloggers', 'Tudo que você precisa para seus vlogs: musicas, efeitos e memes.', 'packs', 'vlogs', 'pack', '/placeholder-pack.jpg', '/downloads/pack-vlog.zip');
