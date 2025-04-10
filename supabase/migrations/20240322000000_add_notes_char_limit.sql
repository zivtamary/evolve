-- Add character limit constraint to notes table
ALTER TABLE notes
ADD CONSTRAINT notes_content_length_check 
CHECK (length(content) <= 5000);

-- Create a function to truncate content if it exceeds the limit
CREATE OR REPLACE FUNCTION truncate_note_content()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.content) > 5000 THEN
    NEW.content := substring(NEW.content, 1, 5000);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically truncate content before insert or update
CREATE TRIGGER truncate_note_content_trigger
BEFORE INSERT OR UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION truncate_note_content();

-- Add a comment to the table to document the character limit
COMMENT ON TABLE notes IS 'Notes table with a 5000 character limit on content'; 