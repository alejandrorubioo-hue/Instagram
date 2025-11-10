import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bzoovqkuqxnzzlgjkqpe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6b292cWt1cXhuenpsZ2prcXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg5NjQwMDYsImV4cCI6MjAxNDU0MDAwNn0.3n8wQw8k8Qw1n2QwQw8k8Qw1n2QwQw8k8Qw1n2QwQw8';

export const supabase = createClient(supabaseUrl, supabaseKey);