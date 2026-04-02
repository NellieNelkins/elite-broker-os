-- Seed campaigns for the demo user
-- Run this in Supabase SQL Editor after the initial seed

-- Get the first user ID
DO $$
DECLARE
  uid TEXT;
BEGIN
  SELECT id INTO uid FROM "User" LIMIT 1;

  IF uid IS NULL THEN
    RAISE NOTICE 'No user found. Run the initial seed first.';
    RETURN;
  END IF;

  -- Insert campaigns
  INSERT INTO "Campaign" (id, "userId", name, type, status, template, "sentCount", "replyCount", "createdAt", "updatedAt")
  VALUES
    ('camp_springs_q1', uid, 'Springs Q1 2026 Buyers', 'whatsapp', 'in_progress', 'Hi {name}, we have exciting villa options in The Springs...', 89, 23, '2026-03-15', NOW()),
    ('camp_eh_vip', uid, 'Emirates Hills VIP Sellers', 'whatsapp', 'completed', 'Dear {name}, the Emirates Hills market is performing well...', 42, 18, '2026-03-10', NOW()),
    ('camp_palm_new', uid, 'Palm Jumeirah New Listings', 'blast', 'draft', NULL, 0, 0, '2026-03-28', NOW()),
    ('camp_march_report', uid, 'March Market Report', 'newsletter', 'completed', 'Monthly Dubai Real Estate Market Report - March 2026', 1200, 45, '2026-03-01', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Link some contacts to campaigns (first 5 contacts to Springs campaign)
  INSERT INTO "CampaignContact" (id, "campaignId", "contactId", sent, replied, "sentAt")
  SELECT
    'cc_springs_' || c.id,
    'camp_springs_q1',
    c.id,
    true,
    (random() > 0.7),
    '2026-03-16'::timestamp
  FROM "Contact" c
  WHERE c."userId" = uid
  ORDER BY c."createdAt"
  LIMIT 10
  ON CONFLICT ("campaignId", "contactId") DO NOTHING;

  -- Link some contacts to Emirates Hills campaign
  INSERT INTO "CampaignContact" (id, "campaignId", "contactId", sent, replied, "sentAt")
  SELECT
    'cc_eh_' || c.id,
    'camp_eh_vip',
    c.id,
    true,
    (random() > 0.5),
    '2026-03-11'::timestamp
  FROM "Contact" c
  WHERE c."userId" = uid AND c.community = 'Emirates Hills'
  ORDER BY c."createdAt"
  LIMIT 5
  ON CONFLICT ("campaignId", "contactId") DO NOTHING;

END $$;
