import { createClient }
from 'https://esm.sh/@supabase/supabase-js@2';

export const supabase = createClient(
  'https://msudwsdzhbqmqhzcxkon.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdWR3c2R6aGJxbXFoemN4a29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTQ5NzcsImV4cCI6MjA5NjE5MDk3N30.wmGUz_ztJ5N_x0gkq1UycN-L2I9_MEBVNFeOQhKp5hA'
);