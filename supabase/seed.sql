-- Alma Creativa — datos iniciales (espejo del mock actual).
-- Correr DESPUÉS de 001_init.sql. Idempotente (on conflict do nothing).

-- Categorías
insert into public.categories (slug, name, short, icon, tint, sort_order) values
  ('invitaciones','Invitaciones temáticas','Diseño e impresión a tono con tu evento.','Mail','#e9dcc0',1),
  ('numeros-mesa','Números de mesa','Identificadores y señalética de salón.','Hash','#dfe3d6',2),
  ('chocolatitos','Chocolates personalizados','Detalles dulces con tu identidad.','Candy','#f0d9d2',3),
  ('raspaditas','Raspaditas','Dinámicas y sorteos para la fiesta.','Ticket','#e3dbea',4),
  ('caretas','Caretas y props','Accesorios para la pista y las fotos.','VenetianMask','#d8e4e6',5),
  ('pulseras-qr','Pulseras con QR','Acceso, playlist o galería en un escaneo.','QrCode','#dde0ea',6),
  ('trofeos','Trofeos Martín Fierro','Premiaciones y momentos para recordar.','Trophy','#ecdfc2',7),
  ('souvenirs','Souvenirs','El recuerdo que se llevan tus invitados.','Gift','#e8dce4',8)
on conflict (slug) do nothing;

-- Eventos
insert into public.events (slug, name, blurb, sort_order) values
  ('15','Fiesta de 15','La noche más esperada, en cada detalle.',1),
  ('18','Cumpleaños de 18','Mayoría de edad con estilo propio.',2),
  ('bodas','Casamientos','Papelería elegante de principio a fin.',3),
  ('infantiles','Infantiles','Personajes y color para los más chicos.',4),
  ('bat-mitzvah','Bat / Bar Mitzvah','Una celebración con significado.',5),
  ('egresos','Egresos','El cierre de una etapa, bien festejado.',6)
on conflict (slug) do nothing;

-- Productos
insert into public.products (slug, name, category_slug, blurb, details, price_note, featured, sort_order) values
  ('invitacion-tematica-premium','Invitación temática premium','invitaciones','Diseño exclusivo, impresión fina y terminaciones a elección.',
    array['Diseño 100% a medida del evento','Papeles de alto gramaje y texturas','Terminaciones: foil, relieve, troquelado','Sobre y faja opcionales'],'Presupuesto a medida',true,1),
  ('invitacion-digital-animada','Invitación digital animada','invitaciones','Versión animada para compartir por WhatsApp y redes.',
    array['Animación breve','Datos y ubicación','Confirmación de asistencia'],'Presupuesto a medida',false,2),
  ('numeros-mesa-tematicos','Números de mesa temáticos','numeros-mesa','Identificadores a tono con la ambientación del salón.',
    array['Diseño coordinado','Base rígida o soporte','Set completo por cantidad de mesas'],'Presupuesto a medida',true,3),
  ('cartel-bienvenida','Cartel de bienvenida','numeros-mesa','Señalética de ingreso para recibir a tus invitados.',
    array['Gran formato','Atril opcional','Diseño coordinado con la invitación'],'Presupuesto a medida',false,4),
  ('chocolatitos-personalizados','Chocolatitos personalizados','chocolatitos','Envoltorios impresos con el nombre y la temática.',
    array['Diseño de envoltorio','Cantidades por invitado','Armado incluido'],'Desde pedido mínimo',true,5),
  ('raspadita-sorteo','Raspadita de sorteo','raspaditas','Dinámica interactiva para premiar en plena fiesta.',
    array['Capa raspable real','Premios configurables','Diseño a tono'],'Desde pedido mínimo',false,6),
  ('caretas-foto','Caretas para fotos','caretas','Props para la pista y el rincón de fotos.',
    array['Set temático','Cartón rígido','Varilla incluida'],'Desde pedido mínimo',false,7),
  ('pulsera-qr-acceso','Pulsera con QR','pulseras-qr','Acceso, lista de temas o galería compartida en un escaneo.',
    array['QR a medida','Material resistente','Enlace configurable'],'Presupuesto a medida',true,8),
  ('trofeo-martin-fierro','Trofeo Martín Fierro','trofeos','Premiación con estilo para los momentos más divertidos.',
    array['Diseño del galardón','Placa personalizada','Por cantidad de categorías'],'Presupuesto a medida',false,9),
  ('souvenir-personalizado','Souvenir personalizado','souvenirs','El recuerdo que se llevan tus invitados a casa.',
    array['Diseño a medida','Varios formatos','Armado y packaging'],'Desde pedido mínimo',false,10),
  ('kit-mesa-dulce','Kit mesa dulce','souvenirs','Papelería coordinada para la mesa dulce: etiquetas, toppers y banderines.',
    array['Toppers y banderines','Etiquetas para frascos','Cartelería menor'],'Presupuesto a medida',false,11),
  ('invitacion-infantil','Invitación infantil','invitaciones','Personajes, color y diversión para los más chicos.',
    array['Temática del personaje','Impresión a color','Sobre opcional'],'Desde pedido mínimo',false,12)
on conflict (slug) do nothing;

-- Producto <-> evento
insert into public.product_events (product_slug, event_slug) values
  ('invitacion-tematica-premium','15'),('invitacion-tematica-premium','bodas'),('invitacion-tematica-premium','18'),
  ('invitacion-digital-animada','15'),('invitacion-digital-animada','18'),('invitacion-digital-animada','egresos'),
  ('numeros-mesa-tematicos','bodas'),('numeros-mesa-tematicos','15'),('numeros-mesa-tematicos','bat-mitzvah'),
  ('cartel-bienvenida','bodas'),('cartel-bienvenida','15'),('cartel-bienvenida','egresos'),
  ('chocolatitos-personalizados','15'),('chocolatitos-personalizados','18'),('chocolatitos-personalizados','infantiles'),('chocolatitos-personalizados','egresos'),
  ('raspadita-sorteo','15'),('raspadita-sorteo','18'),('raspadita-sorteo','egresos'),
  ('caretas-foto','15'),('caretas-foto','18'),('caretas-foto','infantiles'),('caretas-foto','egresos'),
  ('pulsera-qr-acceso','15'),('pulsera-qr-acceso','18'),('pulsera-qr-acceso','egresos'),('pulsera-qr-acceso','bodas'),
  ('trofeo-martin-fierro','egresos'),('trofeo-martin-fierro','18'),('trofeo-martin-fierro','15'),
  ('souvenir-personalizado','15'),('souvenir-personalizado','bodas'),('souvenir-personalizado','bat-mitzvah'),('souvenir-personalizado','infantiles'),
  ('kit-mesa-dulce','15'),('kit-mesa-dulce','infantiles'),('kit-mesa-dulce','bodas'),
  ('invitacion-infantil','infantiles')
on conflict do nothing;
