UPDATE maps SET image_url = CASE name
    WHEN 'Planeta Tierra' THEN 'https://via.placeholder.com/400x300.png?text=Tierra'
    WHEN 'Planeta Namek' THEN 'https://via.placeholder.com/400x300.png?text=Namek'
    WHEN 'Planeta Vegeta' THEN 'https://via.placeholder.com/400x300.png?text=Vegeta'
    WHEN 'Planeta Kaio' THEN 'https://via.placeholder.com/400x300.png?text=Kaio'
    WHEN 'Arena del Torneo' THEN 'https://via.placeholder.com/400x300.png?text=Torneo'
    WHEN 'Habitación del Tiempo' THEN 'https://via.placeholder.com/400x300.png?text=Time+Chamber'
    WHEN 'Planeta Bills' THEN 'https://via.placeholder.com/400x300.png?text=Bills'
    ELSE image_url
END;
