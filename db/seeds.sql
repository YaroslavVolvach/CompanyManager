INSERT INTO department (name)
VALUES
    ('IT'),
    ('Sales'),
    ('Engineering'),
    ('Customer Service'),
    ('Data Science');

INSERT INTO role (title, salary, department_id)
VALUES
    ('Cyber Secerity', 90000, 1),
    ('IT Specialist', 70000, 1),
    ('Customer Sales Solutions', 120000, 2),
    ('Sales Rep', 70000, 2),
    ('Data Engineer', 100000, 3),
    ('Software Engineer', 120000, 3),
    ('Call Center', 65000, 4),
    ('Customer Service', 55000, 4),
    ('Data Scientist', 100000, 5),
    ('Data Engineer', 100000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Viserys', 'Targaryan', 2,2),
    ('Robb', 'Stark', 5, 5),
    ('Bran', 'Stark', 1, 1),
    ('Ned', 'Stark', 1, 2),
    ('Joffrey', 'Baratheon', 3,2),
    ('Tommen', 'Baratheon', 1, 5),
    ('Khal', 'Drogo', 4, 1),
    ('Cersei', 'Lannister', 3, 2),
    ('Jamie', 'Lanister', 2,5),
    ('Jon', 'Snow', 5, 1),
    ('Grey', 'Worm', 3, 1),
    ('Sansa', 'Stark', 4, 4),
    ('Davos', 'Seaworth', 4,null),
    ('Margaery', 'Tyrell', 2, null),
    ('Tormund', 'Giantsbane', 3, null),
    ('Jorah', 'Mormont', 5, null)
