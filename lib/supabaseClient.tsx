import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbwwowwwcfxhymgtljhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZid3dvd3d3Y2Z4aHltZ3RsamhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzODQxNTEsImV4cCI6MjA3Nzk2MDE1MX0.H8oAizJdXo3dGzg-xwPddU5QCn7g_TuxuwyR-EI5a3c';

export const supabase = createClient(supabaseUrl, supabaseKey);