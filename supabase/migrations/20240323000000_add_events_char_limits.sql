-- Add character limit constraints to events table
ALTER TABLE events
ADD CONSTRAINT events_title_length_check 
CHECK (length(title) <= 100),
ADD CONSTRAINT events_description_length_check 
CHECK (length(description) <= 500);

-- Create a function to truncate title and description if they exceed the limits
CREATE OR REPLACE FUNCTION truncate_event_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.title) > 100 THEN
    NEW.title := substring(NEW.title, 1, 100);
  END IF;
  IF NEW.description IS NOT NULL AND length(NEW.description) > 500 THEN
    NEW.description := substring(NEW.description, 1, 500);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically truncate fields before insert or update
CREATE TRIGGER truncate_event_fields_trigger
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION truncate_event_fields();

-- Add a comment to the table to document the character limits
COMMENT ON TABLE events IS 'Events table with a 100 character limit on title and 500 character limit on description'; 