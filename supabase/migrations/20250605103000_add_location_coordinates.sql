
-- Add location coordinate columns to partner_events table
ALTER TABLE partner_events
ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;

-- Update the view to include the coordinates
DROP VIEW IF EXISTS partner_events_with_countdown;
CREATE VIEW partner_events_with_countdown AS
SELECT 
    pe.*,
    EXTRACT(DAY FROM (pe.event_date::date - CURRENT_DATE)) AS days_to_event
FROM 
    partner_events pe;
