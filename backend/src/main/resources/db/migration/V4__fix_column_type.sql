ALTER TABLE dataset_insights ALTER COLUMN column_metadata TYPE TEXT USING column_metadata::text;
