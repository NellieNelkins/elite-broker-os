-- Elite Broker OS — Seed Data
-- Paste this in Supabase SQL Editor and click Run
-- Creates: 1 user, 25 contacts, 25 deals, 5 listings

-- 1. Create the broker user
INSERT INTO "User" ("id", "name", "email", "createdAt", "updatedAt") VALUES
('usr_elite_broker_001', 'Elite Broker', 'broker@elitebroker.ae', NOW(), NOW());

-- 2. Insert 25 contacts (your original data from the HTML)
INSERT INTO "Contact" ("id", "userId", "name", "phone", "email", "type", "stage", "priority", "value", "notes", "lastContactedAt", "createdAt", "updatedAt") VALUES
('ct_001', 'usr_elite_broker_001', 'Masood Azhar', '971504505183', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_002', 'usr_elite_broker_001', 'Sameer Joshi', '971506568894', '', 'Buyer', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_003', 'usr_elite_broker_001', 'Sasan', '971508773870', '', 'Buyer', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_004', 'usr_elite_broker_001', 'Sadia', '971504418916', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_005', 'usr_elite_broker_001', 'Hanuma', '971503417794', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_006', 'usr_elite_broker_001', 'Sayed', '971501688293', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_007', 'usr_elite_broker_001', 'Adita', '971506245876', '', 'Buyer', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_008', 'usr_elite_broker_001', 'Mushtaq', '971509106531', '', 'Buyer', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_009', 'usr_elite_broker_001', 'Jamal', '971506446512', '', 'Investor', 'Qualified', 'MEDIUM', 270000, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_010', 'usr_elite_broker_001', 'Kamal Naaman', '971506241668', '', 'Seller', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_011', 'usr_elite_broker_001', 'Hicham', '971529118751', '', 'Buyer', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_012', 'usr_elite_broker_001', 'Ghazal', '971506434579', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_013', 'usr_elite_broker_001', 'Jan', '971506564349', '', 'Buyer', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_014', 'usr_elite_broker_001', 'Syed', '971554560212', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_015', 'usr_elite_broker_001', 'Sujatha', '971504559169', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_016', 'usr_elite_broker_001', 'Suleman', '447910065366', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_017', 'usr_elite_broker_001', 'Venkatesh', '971566820716', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_018', 'usr_elite_broker_001', 'Nikita', '971567054789', '', 'Buyer', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_019', 'usr_elite_broker_001', 'Manik', '971506404690', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_020', 'usr_elite_broker_001', 'Marc', '971502860454', '', 'Seller', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_021', 'usr_elite_broker_001', 'Manuel', '971502132288', '', 'Buyer', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_022', 'usr_elite_broker_001', 'Maha', '971504528619', '', 'Buyer', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_023', 'usr_elite_broker_001', 'Nmesoma', '2348033017310', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_024', 'usr_elite_broker_001', 'Niva', '', '', 'Investor', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW()),
('ct_025', 'usr_elite_broker_001', 'Nouria', '33664944289', '', 'Seller', 'Qualified', 'MEDIUM', 0, 'Villa owner', NOW() - INTERVAL '3 days', NOW(), NOW());

-- 3. Insert 25 deals (linked to contacts)
INSERT INTO "Deal" ("id", "userId", "contactId", "name", "stage", "value", "commission", "probability", "notes", "createdAt", "updatedAt") VALUES
('dl_001', 'usr_elite_broker_001', 'ct_001', 'Masood Azhar', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_002', 'usr_elite_broker_001', 'ct_002', 'Sameer Joshi', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_003', 'usr_elite_broker_001', 'ct_003', 'Sasan', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_004', 'usr_elite_broker_001', 'ct_004', 'Sadia', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_005', 'usr_elite_broker_001', 'ct_005', 'Hanuma', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_006', 'usr_elite_broker_001', 'ct_006', 'Sayed', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_007', 'usr_elite_broker_001', 'ct_007', 'Adita', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_008', 'usr_elite_broker_001', 'ct_008', 'Mushtaq', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_009', 'usr_elite_broker_001', 'ct_009', 'Jamal', 'Qualified', 0, 0.02, 30, 'Qualify budget', NOW(), NOW()),
('dl_010', 'usr_elite_broker_001', 'ct_010', 'Kamal Naaman', 'Qualified', 270000, 0.05, 30, '', NOW(), NOW()),
('dl_011', 'usr_elite_broker_001', 'ct_011', 'Hicham', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_012', 'usr_elite_broker_001', 'ct_012', 'Ghazal', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_013', 'usr_elite_broker_001', 'ct_013', 'Jan', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_014', 'usr_elite_broker_001', 'ct_014', 'Syed', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_015', 'usr_elite_broker_001', 'ct_015', 'Sujatha', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_016', 'usr_elite_broker_001', 'ct_016', 'Suleman', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_017', 'usr_elite_broker_001', 'ct_017', 'Venkatesh', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_018', 'usr_elite_broker_001', 'ct_018', 'Nikita', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_019', 'usr_elite_broker_001', 'ct_019', 'Manik', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_020', 'usr_elite_broker_001', 'ct_020', 'Marc', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_021', 'usr_elite_broker_001', 'ct_021', 'Manuel', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_022', 'usr_elite_broker_001', 'ct_022', 'Maha', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_023', 'usr_elite_broker_001', 'ct_023', 'Nmesoma', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_024', 'usr_elite_broker_001', 'ct_024', 'Niva', 'Qualified', 0, 0.02, 30, '', NOW(), NOW()),
('dl_025', 'usr_elite_broker_001', 'ct_025', 'Nouria', 'Qualified', 0, 0.02, 30, '', NOW(), NOW());

-- 4. Insert 5 listings
INSERT INTO "Listing" ("id", "userId", "name", "type", "price", "address", "bedrooms", "views", "status", "listedAt", "stepDocs", "stepPhotos", "stepPrice", "stepPortal", "stepLive", "createdAt", "updatedAt") VALUES
('ls_001', 'usr_elite_broker_001', '2BR Palm Jumeirah', 'Villa', 3200000, 'Palm Jumeirah, Frond M, Villa 12', '2', 48, 'Active', NOW() - INTERVAL '14 days', true, true, true, true, true, NOW(), NOW()),
('ls_002', 'usr_elite_broker_001', '3BR Downtown Dubai', 'Apartment', 4800000, 'Downtown Dubai, Burj Vista Tower 1, 24F', '3', 21, 'Active', NOW() - INTERVAL '32 days', true, true, true, true, true, NOW(), NOW()),
('ls_003', 'usr_elite_broker_001', 'Studio JVC', 'Apartment', 850000, 'JVC District 10, Belgravia Sq, Unit 304', '0', 62, 'Active', NOW() - INTERVAL '7 days', true, true, true, false, false, NOW(), NOW()),
('ls_004', 'usr_elite_broker_001', '4BR Emirates Hills', 'Villa', 12500000, 'Emirates Hills, Sector E, Villa 7', '4', 18, 'Under Offer', NOW() - INTERVAL '45 days', true, true, true, true, true, NOW(), NOW()),
('ls_005', 'usr_elite_broker_001', '1BR Dubai Marina', 'Apartment', 1200000, 'Dubai Marina, Marina Gate 2, Unit 1802', '1', 9, 'Active', NOW() - INTERVAL '55 days', true, false, true, false, false, NOW(), NOW());
