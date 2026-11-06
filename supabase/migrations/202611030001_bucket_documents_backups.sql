-- The private bucket also holds contract documents (up to 10 MB, e.g. PDF) and daily workspace backups (JSON).
-- Limits per file type are enforced by the server routes; the bucket stays private with no browser policies.
update storage.buckets
set file_size_limit = 15000000, allowed_mime_types = null, public = false
where id = 'baunavi-evidence';
