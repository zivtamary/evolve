-- Add character limit constraint to todos table
ALTER TABLE todos
ADD CONSTRAINT todos_title_length_check 
CHECK (length(title) <= 100);

-- Create a function to truncate title if it exceeds the limit
CREATE OR REPLACE FUNCTION truncate_todo_title()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.title) > 100 THEN
    NEW.title := substring(NEW.title, 1, 100);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically truncate title before insert or update
CREATE TRIGGER truncate_todo_title_trigger
BEFORE INSERT OR UPDATE ON todos
FOR EACH ROW
EXECUTE FUNCTION truncate_todo_title();

-- Add a comment to the table to document the character limit
COMMENT ON TABLE todos IS 'Todos table with a 100 character limit on title'; 