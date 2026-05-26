-- Step 1: Add ownership column with safe default so existing rows are valid
ALTER TABLE library_entries
    ADD COLUMN ownership VARCHAR(10) NOT NULL DEFAULT 'NONE';

-- Step 2: Make status nullable before we NULL-out WISHLIST rows
ALTER TABLE library_entries
    ALTER COLUMN status DROP NOT NULL;

-- Step 3: Migrate is_owned=true rows to OWNED (non-WISHLIST rows stay OWNED after step 4)
UPDATE library_entries
    SET ownership = 'OWNED'
    WHERE is_owned = true;

-- Step 4: WISHLIST rows take precedence — set ownership=WISHLIST and clear status
UPDATE library_entries
    SET ownership = 'WISHLIST',
        status    = NULL
    WHERE status = 'WISHLIST';

-- Step 5: Enforce the invariant at the DB level
ALTER TABLE library_entries
    ADD CONSTRAINT chk_wishlist_no_status
        CHECK (ownership <> 'WISHLIST' OR status IS NULL);

-- Step 6: Remove the now-redundant is_owned column
ALTER TABLE library_entries
    DROP COLUMN is_owned;
