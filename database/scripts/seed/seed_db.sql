INSERT INTO "Tags" ("Name") VALUES 
('C#'), ('ASP.NET Core'), ('Angular'), ('PostgreSQL'), 
('Embedded C'), ('ESP32'), ('Python'), ('Computer Vision'), ('PCB Design')
ON CONFLICT ("Name") DO NOTHING;

INSERT INTO "Users" ("Username", "Email", "PasswordHash", "Role", "MemberSince") VALUES 
('johndoe', 'john.doe@example.com', '$2a$11$K.x0E8W8zJ9Y3yR6m1p2E.O7z2C1Z9w8E7R6T5Y4U3I2O1P0A9S8D', 'User', NOW()),
('embedded_dev', 'drone.maker@example.com', '$2a$11$K.x0E8W8zJ9Y3yR6m1p2E.O7z2C1Z9w8E7R6T5Y4U3I2O1P0A9S8D', 'User', NOW()),
('admin_user', 'admin@enthcollab.local', '$2a$11$K.x0E8W8zJ9Y3yR6m1p2E.O7z2C1Z9w8E7R6T5Y4U3I2O1P0A9S8D', 'Admin', NOW())
ON CONFLICT ("Email") DO NOTHING;

INSERT INTO "Projects" ("Name", "Status", "Visibility", "Description", "Hazard", "CreatedByUserId") VALUES 
('Autonomous Crop-Monitoring UAV', 'WIP', 'Public', 'Building an ESP32-based drone with OpenCV object detection for agriculture.', 'LiPo battery handling and spinning propellers.', 
    (SELECT "Id" FROM "Users" WHERE "Username" = 'embedded_dev')),
('EnthCollab Platform Core', 'WIP', 'Public', 'Web platform for volunteer developers to assemble teams for pet projects.', 'None', 
    (SELECT "Id" FROM "Users" WHERE "Username" = 'johndoe')),
('Secret Hardware Synth', 'Frozen', 'Private', 'Analog synthesizer prototype using custom PCBs.', 'High voltage power supply testing.', 
    (SELECT "Id" FROM "Users" WHERE "Username" = 'embedded_dev'))
ON CONFLICT DO NOTHING;

INSERT INTO "ProjectTag" ("ProjectsId", "TagsId")
SELECT p."Id", t."Id" FROM "Projects" p, "Tags" t 
WHERE p."Name" = 'Autonomous Crop-Monitoring UAV' AND t."Name" IN ('ESP32', 'Python', 'Computer Vision')
ON CONFLICT DO NOTHING;

INSERT INTO "ProjectTag" ("ProjectsId", "TagsId")
SELECT p."Id", t."Id" FROM "Projects" p, "Tags" t 
WHERE p."Name" = 'EnthCollab Platform Core' AND t."Name" IN ('C#', 'ASP.NET Core', 'Angular', 'PostgreSQL')
ON CONFLICT DO NOTHING;