CREATE TABLE users
(
    id SERIAL,
    fullName text,
    email text,
    phone text,
    CONSTRAINT userID PRIMARY KEY (id)
);
INSERT INTO users(fullName, email, phone) VALUES
 ('Meadow Crystalfreak', 'meadow@example.com' , '658 887 977'),
 ('Winny Affron', 'winny@example.com' , '625 221 014'),
 ('Emily Gregoretti', 'egregoretti3@1und1.de', '687 877 778' )
 ('Trudie Myatt', 'meadow@example.com' , '698 025 332');